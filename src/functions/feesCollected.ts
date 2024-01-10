/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { SupportedChainId, SupportedDex, TotalAmounts, TotalAmountsBN } from '../types';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';
import { getRebalances } from './rebalances';
import { getTokenDecimals } from './balances';
import formatBigInt from '../utils/formatBigInt';

export async function getFeesCollected(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<TotalAmounts>;

export async function getFeesCollected(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
  days?: number,
): Promise<TotalAmountsBN>;

export async function getFeesCollected(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  rawOrDays?: true | number,
  days?: number,
): Promise<TotalAmounts | TotalAmountsBN> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault not found on ${chainId}: ${vaultAddress}`);
  const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider);
  const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider);

  const numOfDays = typeof rawOrDays === 'boolean' ? days : rawOrDays
  const rebalances = await getRebalances(vaultAddress, jsonProvider, dex, numOfDays);
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);
  console.log({rebalances});

  const amount0BN = rebalances.map((r) => (BigNumber.from(r.feeAmount0))).reduce((total, curr) => total.add(curr), BigNumber.from(0));
  const amount1BN = rebalances.map((r) => (BigNumber.from(r.feeAmount1))).reduce((total, curr) => total.add(curr), BigNumber.from(0));

  const feeAmountsBN = {
    total0: amount0BN,
    total1: amount1BN,
    0: amount0BN,
    1: amount1BN,
  } as TotalAmountsBN;

  if (typeof rawOrDays  !== 'boolean') {
    const feeAmounts = {
      total0: formatBigInt(feeAmountsBN.total0, token0Decimals),
      total1: formatBigInt(feeAmountsBN.total1, token1Decimals),
      0: formatBigInt(feeAmountsBN.total0, token0Decimals),
      1: formatBigInt(feeAmountsBN.total1, token1Decimals),
    } as TotalAmounts;
    console.log({feeAmounts});
    return feeAmounts;
  }

  return feeAmountsBN;
}
