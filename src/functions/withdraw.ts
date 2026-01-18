/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/prefer-default-export */

import { ContractTransaction, Overrides } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { MaxUint256 } from '@ethersproject/constants';
import { getDepositGuardContract, getERC20Contract, getIchiVaultContract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { SupportedChainId, SupportedDex, ichiVaultDecimals } from '../types';
import { _isVaultTokenApproved } from './_withdrawHelpers';
import { getGasLimit, calculateGasMargin } from '../types/calculateGasMargin';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { addressConfig } from '../utils/config/addresses';
import amountWithSlippage from '../utils/amountWithSlippage';
import { getUserBalance } from './userBalances';
import getVaultDeployer from './vaultBasics';

export async function approveVaultToken(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  shares?: string | number | BigNumber,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const signer = jsonProvider.getSigner(accountAddress);

  const vaultTokenContract = getERC20Contract(vaultAddress, signer);

  // eslint-disable-next-line no-nested-ternary
  const sharesBN = shares
    ? shares instanceof BigNumber
      ? shares
      : parseBigInt(shares, ichiVaultDecimals)
    : MaxUint256;

  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(await vaultTokenContract.estimateGas.approve(depositGuardAddress, sharesBN));

  return vaultTokenContract.approve(depositGuardAddress, sharesBN, { gasLimit });
}

export async function isVaultTokenApproved(
  accountAddress: string,
  shares: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  return _isVaultTokenApproved(accountAddress, shares, vault, chainId, jsonProvider, dex);
}

export async function withdraw(
  accountAddress: string,
  shares: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const signer = jsonProvider.getSigner(accountAddress);
  const vaultContract = getIchiVaultContract(vaultAddress, signer);

  const userShares = getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  const withdrawShares = shares instanceof BigNumber ? shares : parseBigInt(shares, 18);
  if ((await userShares).lt(withdrawShares)) {
    throw new Error(
      `Withdraw amount exceeds user shares amount in vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const params: Parameters<typeof vaultContract.withdraw> = [
    shares instanceof BigNumber ? shares : parseBigInt(shares, 18),
    accountAddress,
  ];
  const gasLimit = overrides?.gasLimit ?? calculateGasMargin(await vaultContract.estimateGas.withdraw(...params));
  params[2] = { ...overrides, gasLimit };

  return vaultContract.withdraw(...params);
}

export async function withdrawWithSlippage(
  accountAddress: string,
  shares: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  if (addressConfig[chainId as SupportedChainId][dex]?.depositGuard.version !== 2) {
    throw new Error(`Unsupported function for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }

  const signer = jsonProvider.getSigner(accountAddress);

  const vaultDeployerAddress = getVaultDeployer(vaultAddress, chainId, dex);

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }

  const userShares = getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  const withdrawShares = shares instanceof BigNumber ? shares : parseBigInt(shares, 18);
  if ((await userShares).lt(withdrawShares)) {
    throw new Error(
      `Withdraw amount exceeds user shares amount in vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const isApproved = await _isVaultTokenApproved(accountAddress, withdrawShares, vault, chainId, jsonProvider, dex);
  if (!isApproved) {
    throw new Error(
      `Vault token transfer is not approved for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);
  const maxGasLimit = getGasLimit(chainId);

  // the first call: get estimated LP amount
  let amounts = await depositGuardContract.callStatic.forwardWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    BigNumber.from(0),
    BigNumber.from(0),
    {
      gasLimit: maxGasLimit,
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, default - 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  amounts = {
    0: amountWithSlippage(amounts[0], percentSlippage),
    1: amountWithSlippage(amounts[1], percentSlippage),
    amount0: amountWithSlippage(amounts[0], percentSlippage),
    amount1: amountWithSlippage(amounts[1], percentSlippage),
  } as [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber };

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.estimateGas.forwardWithdrawFromICHIVault(
        vaultAddress,
        vaultDeployerAddress,
        withdrawShares,
        accountAddress,
        amounts[0],
        amounts[1],
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.forwardWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    amounts[0],
    amounts[1],
    {
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}

export async function withdrawNativeToken(
  accountAddress: string,
  shares: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  if (chainId === SupportedChainId.celo) {
    throw new Error(`This function is not supported on chain ${chainId}`);
  }

  if (addressConfig[chainId as SupportedChainId][dex]?.depositGuard.version !== 2) {
    throw new Error(`Unsupported function for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }

  const signer = jsonProvider.getSigner(accountAddress);

  const vaultDeployerAddress = getVaultDeployer(vaultAddress, chainId, dex);

  const userShares = getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  const withdrawShares = shares instanceof BigNumber ? shares : parseBigInt(shares, 18);
  if ((await userShares).lt(withdrawShares)) {
    throw new Error(
      `Withdraw amount exceeds user shares amount in vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const isApproved = await _isVaultTokenApproved(accountAddress, withdrawShares, vault, chainId, jsonProvider, dex);
  if (!isApproved) {
    throw new Error(
      `Vault token transfer is not approved for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);
  const wrappedNative =
    chainId === SupportedChainId.hedera
      ? '0x0000000000000000000000000000000000163b5a'
      : await depositGuardContract.WRAPPED_NATIVE();
  if (
    wrappedNative.toLowerCase() !== vault.tokenA.toLowerCase() &&
    wrappedNative.toLowerCase() !== vault.tokenB.toLowerCase()
  ) {
    throw new Error('None of vault tokens is wrapped native token');
  }

  const maxGasLimit = getGasLimit(chainId);

  // the first call: get estimated LP amount
  let amounts = await depositGuardContract.callStatic.forwardNativeWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    BigNumber.from(0),
    BigNumber.from(0),
    {
      gasLimit: maxGasLimit,
    },
  );

  // reduce the estimated LP amount by an acceptable slippage %, default - 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  amounts = {
    0: amountWithSlippage(amounts[0], percentSlippage),
    1: amountWithSlippage(amounts[1], percentSlippage),
    amount0: amountWithSlippage(amounts[0], percentSlippage),
    amount1: amountWithSlippage(amounts[1], percentSlippage),
  } as [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber };

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.estimateGas.forwardNativeWithdrawFromICHIVault(
        vaultAddress,
        vaultDeployerAddress,
        withdrawShares,
        accountAddress,
        amounts[0],
        amounts[1],
      ),
    );

  // the second call: actual deposit transaction
  const tx = await depositGuardContract.forwardNativeWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    amounts[0],
    amounts[1],
    {
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}
