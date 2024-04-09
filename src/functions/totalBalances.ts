/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getERC20Contract, getIchiVaultContract } from '../contracts';
import { SupportedChainId, SupportedDex, TotalAmounts, TotalAmountsBN, ichiVaultDecimals } from '../types';
import formatBigInt from '../utils/formatBigInt';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';

export async function getTokenDecimals(tokenAddress: string, jsonProvider: JsonRpcProvider): Promise<number> {
  const tokenContract = getERC20Contract(tokenAddress, jsonProvider);
  const tokenDecimals = await tokenContract.decimals();
  return tokenDecimals ?? 18;
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
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

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
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const totalSupply = await vaultContract.totalSupply();

  return raw ? totalSupply : formatBigInt(totalSupply, ichiVaultDecimals);
}
