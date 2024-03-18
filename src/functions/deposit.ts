import { ContractTransaction, Overrides } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { MaxUint256 } from '@ethersproject/constants';
import { BigNumber } from 'ethers';
import { getDepositGuardContract, getERC20Contract, getIchiVaultContract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { SupportedDex, SupportedChainId } from '../types';
import calculateGasMargin from '../types/calculateGasMargin';
import formatBigInt from '../utils/formatBigInt';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';
import addressConfig from '../utils/config/addresses';
import amountWithSlippage from '../utils/amountWithSlippage';

export async function isTokenAllowed(
  tokenIdx: 0 | 1,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const tokenAllowed = vault[tokenIdx === 0 ? 'allowTokenA' : 'allowTokenB'];

  return tokenAllowed;
}

export async function isDepositTokenApproved(
  accountAddress: string,
  tokenIdx: 0 | 1,
  amount: string | number,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const signer = jsonProvider.getSigner(accountAddress);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const token = vault[tokenIdx === 0 ? 'tokenA' : 'tokenB'];

  const tokenContract = getERC20Contract(token, signer);
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const currentAllowanceBN = await tokenContract.allowance(accountAddress, depositGuardAddress);
  const tokenDecimals = await tokenContract.decimals();

  const currentAllowance = +formatBigInt(currentAllowanceBN, +tokenDecimals);

  return currentAllowance !== 0 && currentAllowance >= +(amount ?? 0);
}

export async function approveDepositToken(
  accountAddress: string,
  tokenIdx: 0 | 1,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  amount?: string | number | BigNumber,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const signer = jsonProvider.getSigner(accountAddress);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const token = vault[tokenIdx === 0 ? 'tokenA' : 'tokenB'];

  const tokenContract = getERC20Contract(token, signer);
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

export async function getMaxDepositAmount(
  tokenIdx: 0 | 1,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<BigNumber> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);

  const maxDepositAmount = tokenIdx === 0 ? vaultContract.deposit0Max() : vaultContract.deposit1Max();

  return maxDepositAmount;
}

export async function deposit(
  accountAddress: string,
  amount0: string | number | BigNumber,
  amount1: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  const signer = jsonProvider.getSigner(accountAddress);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  const vaultDeployerAddress = addressConfig[chainId as SupportedChainId]![dex]?.vaultDeployerAddress;
  if (!vaultDeployerAddress) {
    throw new Error(`Vault deployer not found for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }

  const token0 = vault.tokenA;
  const token1 = vault.tokenB;
  const isToken0Allowed = vault.allowTokenA;
  const isToken1Allowed = vault.allowTokenB;
  const token0Contract = getERC20Contract(token0, signer);
  const token1Contract = getERC20Contract(token1, signer);
  const token0Decimals = await token0Contract.decimals();
  const token1Decimals = await token1Contract.decimals();
  const amount0BN = amount0 instanceof BigNumber ? amount0 : parseBigInt(amount0, +token0Decimals);
  const amount1BN = amount1 instanceof BigNumber ? amount1 : parseBigInt(amount1, +token1Decimals);
  if (!isToken0Allowed && amount0BN > BigNumber.from(0)) {
    throw new Error(`Deposit of token0 is not allowed: ${chainId}, ${vaultAddress}`);
  }
  if (!isToken1Allowed && amount1BN > BigNumber.from(0)) {
    throw new Error(`Deposit of token1 is not allowed: ${chainId}, ${vaultAddress}`);
  }
  let depositAmount = amount0BN;
  let depositToken = token0;
  if (amount1BN > BigNumber.from(0)) {
    depositAmount = amount1BN;
    depositToken = token1;
  }

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address ?? '';
  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);

  // the first call: get estimated LP amount
  let lpAmount = await depositGuardContract.callStatic.forwardDepositToICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    depositToken,
    depositAmount,
    BigNumber.from(0),
    accountAddress,
    {
      gasLimit: 5e6, // the deposit via guard tx should never exceed 5e6
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, for example 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  lpAmount = lpAmount.mul(Math.floor((100 - percentSlippage) * 1000)).div(100000);

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.estimateGas.forwardDepositToICHIVault(
        vaultAddress,
        vaultDeployerAddress,
        depositToken,
        depositAmount,
        lpAmount,
        accountAddress,
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.forwardDepositToICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    depositToken,
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

export async function depositNativeToken(
  accountAddress: string,
  amount0: string | number | BigNumber,
  amount1: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  if (addressConfig[chainId as SupportedChainId][dex]?.depositGuard.version !== 2) {
    throw new Error(`Unsupported function for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }
  const signer = jsonProvider.getSigner(accountAddress);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  const vaultDeployerAddress = addressConfig[chainId as SupportedChainId]![dex]?.vaultDeployerAddress;
  if (!vaultDeployerAddress) {
    throw new Error(`Vault deployer not found for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }

  const token0 = vault.tokenA;
  const token1 = vault.tokenB;
  const isToken0Allowed = vault.allowTokenA;
  const isToken1Allowed = vault.allowTokenB;
  const token0Contract = getERC20Contract(token0, signer);
  const token1Contract = getERC20Contract(token1, signer);
  const token0Decimals = await token0Contract.decimals();
  const token1Decimals = await token1Contract.decimals();
  const amount0BN = amount0 instanceof BigNumber ? amount0 : parseBigInt(amount0, +token0Decimals);
  const amount1BN = amount1 instanceof BigNumber ? amount1 : parseBigInt(amount1, +token1Decimals);
  if (!isToken0Allowed && amount0BN > BigNumber.from(0)) {
    throw new Error(`Deposit of token0 is not allowed: ${chainId}, ${vaultAddress}`);
  }
  if (!isToken1Allowed && amount1BN > BigNumber.from(0)) {
    throw new Error(`Deposit of token1 is not allowed: ${chainId}, ${vaultAddress}`);
  }
  let depositAmount = amount0BN;
  let depositToken = token0;
  if (amount1BN > BigNumber.from(0)) {
    depositAmount = amount1BN;
    depositToken = token1;
  }

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard not found for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }
  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);
  const wrappedNative = await depositGuardContract.WRAPPED_NATIVE();
  if (wrappedNative !== depositToken) {
    throw new Error('Deposit token is not wrapped native token');
    // if (chainId !== SupportedChainId.hedera) {
    //   throw new Error('Deposit token is not wrapped native token');
    // }
  }

  // if (chainId === SupportedChainId.hedera){
  //   depositAmount = depositAmount.mul(BigNumber.from(1e10));
  // }

  // the first call: get estimated LP amount
  let lpAmount = await depositGuardContract.callStatic.forwardNativeDepositToICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    BigNumber.from(0),
    accountAddress,
    {
      value: depositAmount,
      gasLimit: 5e6, // the deposit via guard tx should never exceed 5e6
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, for example 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  lpAmount = amountWithSlippage(lpAmount, percentSlippage);

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.estimateGas.forwardNativeDepositToICHIVault(
        vaultAddress,
        vaultDeployerAddress,
        lpAmount,
        accountAddress,
        {
          value: depositAmount,
        },
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.forwardNativeDepositToICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    lpAmount,
    accountAddress,
    {
      value: depositAmount,
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}
