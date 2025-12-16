import { ContractTransaction, Overrides } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import {
  getDepositGuardWithHtsWrappingContract,
  getERC20Contract,
  getERC20WrapperContract,
  getIchiVaultContract,
} from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { SupportedDex, SupportedChainId } from '../types';
import { calculateGasMargin, getGasLimit } from '../types/calculateGasMargin';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { addressConfig, ERC20_WRAPPER_ADDRESS } from '../utils/config/addresses';
import getVaultDeployer from './vaultBasics';
import { getTokenDecimals } from './_totalBalances';

export async function isTokenApproved(
  accountAddress: string,
  tokenAddress: string,
  amount: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const tokenContract = getERC20Contract(tokenAddress, jsonProvider);
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const currentAllowanceBN = await tokenContract.allowance(accountAddress, depositGuardAddress);
  const tokenDecimals = await tokenContract.decimals();

  const amountBN = amount instanceof BigNumber ? amount : parseBigInt(amount, tokenDecimals);

  return currentAllowanceBN.gt(BigNumber.from(0)) && currentAllowanceBN.gte(amountBN);
}

export async function approveToken(
  accountAddress: string,
  tokenAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  amount?: string | number | BigNumber,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const signer = jsonProvider.getSigner(accountAddress);

  const tokenContract = getERC20Contract(tokenAddress, signer);
  const tokenDecimals = await tokenContract.decimals();

  // eslint-disable-next-line no-nested-ternary
  const amountBN = amount
    ? amount instanceof BigNumber
      ? amount
      : parseBigInt(amount, +tokenDecimals || 18)
    : MaxUint256;

  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const gasLimit =
    overrides?.gasLimit ?? calculateGasMargin(await tokenContract.estimateGas.approve(depositGuardAddress, amountBN));

  return tokenContract.approve(depositGuardAddress, amountBN, { gasLimit });
}

export async function getActualDepositToken(
  depositToken: string,
  jsonProvider: JsonRpcProvider,
): Promise<string> {
  const erc20WrapperContract = getERC20WrapperContract(ERC20_WRAPPER_ADDRESS, jsonProvider);
  const erc20Counterpart = await erc20WrapperContract.erc20Counterpart(depositToken);

  // If there's a valid ERC20 counterpart (non-zero address), return it; otherwise return original token
  return erc20Counterpart !== '0x0000000000000000000000000000000000000000' ? erc20Counterpart : depositToken;
}

export async function depositWithHtsWrapping(
  accountAddress: string,
  amount0: string | number | BigNumber,
  amount1: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);

  // This function is only applicable for BONZO vaults on Hedera
  if (dex !== SupportedDex.Bonzo || chainId !== SupportedChainId.hedera) {
    throw new Error(
      `depositWithHtsWrapping is only supported for Bonzo vaults on Hedera. Got dex: ${dex}, chainId: ${chainId}`,
    );
  }

  const signer = jsonProvider.getSigner(accountAddress);
  const vaultDeployerAddress = getVaultDeployer(vaultAddress, chainId, dex);

  const token0 = vault.tokenA;
  const token1 = vault.tokenB;
  const isToken0Allowed = vault.allowTokenA;
  const isToken1Allowed = vault.allowTokenB;
  const token0Decimals = await getTokenDecimals(token0, jsonProvider, chainId);
  const token1Decimals = await getTokenDecimals(token1, jsonProvider, chainId);
  const amount0BN = amount0 instanceof BigNumber ? amount0 : parseBigInt(amount0, +token0Decimals);
  const amount1BN = amount1 instanceof BigNumber ? amount1 : parseBigInt(amount1, +token1Decimals);

  if (!isToken0Allowed && amount0BN.gt(BigNumber.from(0))) {
    throw new Error(`Deposit of token0 is not allowed: ${chainId}, ${vaultAddress}`);
  }
  if (!isToken1Allowed && amount1BN.gt(BigNumber.from(0))) {
    throw new Error(`Deposit of token1 is not allowed: chain ${chainId}, vault ${vaultAddress}`);
  }

  let depositAmount = amount0BN;
  let depositToken = token0;
  if (amount1BN.gt(BigNumber.from(0))) {
    depositAmount = amount1BN;
    depositToken = token1;
  }

  // Check if the deposit token has an ERC20 counterpart
  const actualDepositToken = await getActualDepositToken(depositToken, jsonProvider);

  const isApproved = await isTokenApproved(accountAddress, actualDepositToken, depositAmount, vaultAddress, jsonProvider, dex);
  if (!isApproved) {
    throw new Error(
      `Deposit is not approved for token: ${actualDepositToken}, chain ${chainId}, vault ${vaultAddress}`,
    );
  }

  const tokenContract = getERC20Contract(actualDepositToken, jsonProvider);
  const userTokenBalance = await tokenContract.balanceOf(accountAddress);

  if (userTokenBalance.lt(depositAmount)) {
    throw new Error(`Deposit amount exceeds user token amount for token: ${actualDepositToken}, chain ${chainId}`);
  }

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const maxDeposit0 = await vaultContract.deposit0Max();
  const maxDeposit1 = await vaultContract.deposit1Max();
  if (amount0BN.gt(maxDeposit0) || amount1BN.gt(maxDeposit1)) {
    throw new Error(`Deposit amount exceeds max deposit amount: vault ${vaultAddress}, chain ${chainId}`);
  }

  // Obtain Deposit Guard with HTS Wrapping contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const depositGuardContract = getDepositGuardWithHtsWrappingContract(depositGuardAddress, signer);
  const maxGasLimit = getGasLimit(chainId);

  // the first call: get estimated LP amount
  let lpAmount = await depositGuardContract.callStatic.depositToICHIVaultAndTryWrapToHTS(
    vaultAddress,
    vaultDeployerAddress,
    actualDepositToken,
    depositAmount,
    BigNumber.from(0),
    accountAddress,
    {
      gasLimit: maxGasLimit,
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, for example 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  lpAmount = lpAmount.mul(Math.floor((100 - percentSlippage) * 1000)).div(100000);

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.estimateGas.depositToICHIVaultAndTryWrapToHTS(
        vaultAddress,
        vaultDeployerAddress,
        actualDepositToken,
        depositAmount,
        lpAmount,
        accountAddress,
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.depositToICHIVaultAndTryWrapToHTS(
    vaultAddress,
    vaultDeployerAddress,
    actualDepositToken,
    depositAmount,
    lpAmount,
    accountAddress,
    {
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}
