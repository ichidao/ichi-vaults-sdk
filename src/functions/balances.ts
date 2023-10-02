/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getERC20Contract, getIchiVaultContract } from '../contracts';
import {
  SupportedChainId,
  SupportedDex,
  TotalAmounts,
  TotalAmountsBN,
  UserAmounts,
  UserAmountsBN,
  ichiVaultDecimals,
} from '../types';
import formatBigInt from '../utils/formatBigInt';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';

export async function getTokenDecimals(tokenAddress: string, jsonProvider: JsonRpcProvider): Promise<number> {
  const tokenContract = getERC20Contract(tokenAddress, jsonProvider);
  const tokenDecimals = await tokenContract.decimals();
  return tokenDecimals ?? 18;
}

export async function getUserBalance(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<string>;

export async function getUserBalance(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<BigNumber>;

export async function getUserBalance(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress);
  if (!vault) throw new Error(`Vault not found [${chainId}, ${vaultAddress}]`);

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const shares = await vaultContract.balanceOf(accountAddress);

  return raw ? shares : formatBigInt(shares, ichiVaultDecimals);
}

export async function getTotalAmounts(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<TotalAmounts>;

export async function getTotalAmounts(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<TotalAmountsBN>;

export async function getTotalAmounts(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress);
  if (!vault) throw new Error(`Vault not found [${chainId}, ${vaultAddress}]`);

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const totalAmountsBN = await vaultContract.getTotalAmounts();

  if (!raw) {
    const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider);
    const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider);
    const totalAmounts = {
      total0: formatBigInt(totalAmountsBN.total0, token0Decimals),
      total1: formatBigInt(totalAmountsBN.total1, token1Decimals),
      0: formatBigInt(totalAmountsBN.total0, token0Decimals),
      1: formatBigInt(totalAmountsBN.total1, token1Decimals),
    } as TotalAmounts;
    return totalAmounts;
  }

  return totalAmountsBN;
}

export async function getTotalSupply(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<string>;

export async function getTotalSupply(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<BigNumber>;

export async function getTotalSupply(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress);
  if (!vault) throw new Error(`Vault not found [${chainId}, ${vaultAddress}]`);

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const totalSupply = await vaultContract.totalSupply();

  return raw ? totalSupply : formatBigInt(totalSupply, ichiVaultDecimals);
}

export async function getUserAmounts(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<UserAmounts>;

export async function getUserAmounts(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<UserAmountsBN>;

export async function getUserAmounts(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress);
  if (!vault) throw new Error(`Vault not found [${chainId}, ${vaultAddress}]`);

  const totalAmountsBN = await getTotalAmounts(vaultAddress, jsonProvider, dex, true);
  const totalSupplyBN = await vaultContract.totalSupply();
  const userBalanceBN = await getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  if (totalSupplyBN !== BigNumber.from(0)) {
    const userAmountsBN = {
      amount0: userBalanceBN.mul(totalAmountsBN[0]).div(totalSupplyBN),
      amount1: userBalanceBN.mul(totalAmountsBN[1]).div(totalSupplyBN),
      0: userBalanceBN.mul(totalAmountsBN[0]).div(totalSupplyBN),
      1: userBalanceBN.mul(totalAmountsBN[1]).div(totalSupplyBN),
    } as UserAmountsBN;
    if (!raw) {
      const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider);
      const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider);
      const userAmounts = {
        amount0: formatBigInt(userAmountsBN.amount0, token0Decimals),
        amount1: formatBigInt(userAmountsBN.amount1, token1Decimals),
        0: formatBigInt(userAmountsBN.amount0, token0Decimals),
        1: formatBigInt(userAmountsBN.amount1, token1Decimals),
      } as UserAmounts;
      return userAmounts;
    } else {
      return userAmountsBN;
    }
  } else if (!raw) {
    return {
      amount0: '0',
      amount1: '0',
      0: '0',
      1: '0',
    } as UserAmounts;
  } else {
    return {
      amount0: BigNumber.from(0),
      amount1: BigNumber.from(0),
      0: BigNumber.from(0),
      1: BigNumber.from(0),
    } as UserAmountsBN;
  }
}
