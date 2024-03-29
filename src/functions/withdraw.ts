/* eslint-disable import/prefer-default-export */

import { ContractTransaction, Overrides } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { MaxUint256 } from '@ethersproject/constants';
import { getDepositGuardContract, getERC20Contract, getIchiVaultContract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { SupportedChainId, SupportedDex, ichiVaultDecimals } from '../types';
import calculateGasMargin from '../types/calculateGasMargin';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';
import addressConfig from '../utils/config/addresses';
import amountWithSlippage from '../utils/amountWithSlippage';
import formatBigInt from '../utils/formatBigInt';

export async function approveVaultToken(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  shares?: string | number | BigNumber,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }

  const signer = jsonProvider.getSigner(accountAddress);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const vaultTokenContract = getERC20Contract(vaultAddress, signer);
  const vaultTokenDecimals = ichiVaultDecimals;

  // eslint-disable-next-line no-nested-ternary
  const sharesBN = shares
    ? shares instanceof BigNumber
      ? shares
      : parseBigInt(shares, +vaultTokenDecimals || 18)
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
  shares: string | number,
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

  const vaultTokenContract = getERC20Contract(vaultAddress, signer);
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const currentAllowanceBN = await vaultTokenContract.allowance(accountAddress, depositGuardAddress);
  const vaultTokenDecimals = ichiVaultDecimals;

  const currentAllowance = +formatBigInt(currentAllowanceBN, vaultTokenDecimals);

  return currentAllowance !== 0 && currentAllowance >= +(shares ?? 0);
}

export async function withdraw(
  accountAddress: string,
  shares: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const signer = jsonProvider.getSigner(accountAddress);

  const vaultContract = getIchiVaultContract(vaultAddress, signer);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

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
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
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

  const withdrawShares = shares instanceof BigNumber ? shares : parseBigInt(shares, 18);

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);

  // the first call: get estimated LP amount
  let amounts = await depositGuardContract.callStatic.forwardWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    BigNumber.from(0),
    BigNumber.from(0),
    {
      gasLimit: 5e6, // the deposit via guard tx should never exceed 5e6
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
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
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

  const withdrawShares = shares instanceof BigNumber ? shares : parseBigInt(shares, 18);

  // obtain Deposit Guard contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard  for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const depositGuardContract = getDepositGuardContract(depositGuardAddress, signer);
  const wrappedNative = await depositGuardContract.WRAPPED_NATIVE();
  if (wrappedNative !== vault.tokenA && wrappedNative !== vault.tokenB) {
    throw new Error('None of vault tokens is wrapped native token');
  }

  // the first call: get estimated LP amount
  let amounts = await depositGuardContract.callStatic.forwardNativeWithdrawFromICHIVault(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    BigNumber.from(0),
    BigNumber.from(0),
    {
      gasLimit: 5e6, // the deposit via guard tx should never exceed 5e6
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
