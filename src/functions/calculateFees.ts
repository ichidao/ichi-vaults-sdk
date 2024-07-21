/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-cycle */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Fees, FeesInfo, SupportedDex, TotalAmounts, TotalAmountsBN, VaultState } from '../types';
import { validateVaultData } from './vault';
import { getTokenDecimals } from './_totalBalances';
import formatBigInt from '../utils/formatBigInt';
import { daysToMilliseconds } from '../utils/timestamps';
import { isTokenAllowed } from './deposit';
import getPrice from '../utils/getPrice';
import { getVaultTvl } from './priceFromPool';
import getGraphUrls from '../utils/getGraphUrls';
import { _getFeesCollectedEvents, _getRebalances } from './_vaultEvents';

function getCollectedTokenAmountBN(ind: 0 | 1, feesDataset: Fees[]): BigNumber {
  const amounts =
    ind === 0
      ? feesDataset.map((r) => BigNumber.from(r.feeAmount0))
      : feesDataset.map((r) => BigNumber.from(r.feeAmount1));
  const amountBN = amounts.reduce((total, curr) => total.add(curr), BigNumber.from(0));
  return amountBN;
}

export function getTotalAmountsAtFeeCollectionEvent(
  objFees: VaultState,
  isVaultInverted: boolean,
  token0Decimals: number,
  token1Decimals: number,
): [number, number] {
  const price0 = !isVaultInverted
    ? 1
    : getPrice(isVaultInverted, BigNumber.from(objFees.sqrtPrice), token0Decimals, token1Decimals);
  const price1 = isVaultInverted
    ? 1
    : getPrice(isVaultInverted, BigNumber.from(objFees.sqrtPrice), token0Decimals, token1Decimals);
  const amount0 = Number(formatBigInt(BigNumber.from(objFees.totalAmount0), token0Decimals)) * price0;
  const amount1 = Number(formatBigInt(BigNumber.from(objFees.totalAmount1), token1Decimals)) * price1;
  return [amount0, amount1];
}

export function getFeesAmountInBaseTokens(
  objFees: Fees,
  isVaultInverted: boolean,
  token0Decimals: number,
  token1Decimals: number,
): number {
  const price0 = !isVaultInverted
    ? 1
    : getPrice(isVaultInverted, BigNumber.from(objFees.sqrtPrice), token0Decimals, token1Decimals);
  const price1 = isVaultInverted
    ? 1
    : getPrice(isVaultInverted, BigNumber.from(objFees.sqrtPrice), token0Decimals, token1Decimals);
  const amount0 = Number(formatBigInt(BigNumber.from(objFees.feeAmount0), token0Decimals)) * price0;
  const amount1 = Number(formatBigInt(BigNumber.from(objFees.feeAmount1), token1Decimals)) * price1;
  return amount0 + amount1;
}

export function getTotalFeesAmountInBaseTokens(
  feesDataset: Fees[],
  t0decimals: number,
  t1decimals: number,
  isInverted: boolean,
): number {
  const amount = feesDataset.reduce(
    (total, curr) => total + getFeesAmountInBaseTokens(curr, isInverted, t0decimals, t1decimals),
    0,
  );
  return amount;
}

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
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  getGraphUrls(chainId, dex, true);

  const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider, chainId);
  const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider, chainId);

  const numOfDays = typeof rawOrDays === 'boolean' ? days : rawOrDays;
  const rebalances = await _getRebalances(vaultAddress, chainId, dex, numOfDays);
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);
  const collectedFees = await _getFeesCollectedEvents(vaultAddress, chainId, dex, numOfDays);
  if (!collectedFees) throw new Error(`Error getting vault collected fees on ${chainId} for ${vaultAddress}`);

  const amount0BN = getCollectedTokenAmountBN(0, rebalances).add(getCollectedTokenAmountBN(0, collectedFees));
  const amount1BN = getCollectedTokenAmountBN(1, rebalances).add(getCollectedTokenAmountBN(1, collectedFees));

  const feeAmountsBN = {
    total0: amount0BN,
    total1: amount1BN,
    0: amount0BN,
    1: amount1BN,
  } as TotalAmountsBN;

  if (typeof rawOrDays !== 'boolean') {
    const feeAmounts = {
      total0: formatBigInt(feeAmountsBN.total0, token0Decimals),
      total1: formatBigInt(feeAmountsBN.total1, token1Decimals),
      0: formatBigInt(feeAmountsBN.total0, token0Decimals),
      1: formatBigInt(feeAmountsBN.total1, token1Decimals),
    } as TotalAmounts;
    return feeAmounts;
  }

  return feeAmountsBN;
}

export async function getFeesCollectedInfo(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  forDays?: number[],
): Promise<FeesInfo[]> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  getGraphUrls(chainId, dex, true);

  const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider, chainId);
  const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider, chainId);
  const isVaultInverted = await isTokenAllowed(1, vaultAddress, jsonProvider, dex);

  const tvl = await getVaultTvl(vault, jsonProvider, chainId, dex, isVaultInverted, token0Decimals, token1Decimals);

  const defaultArrayDays = [1, 7, 30];
  const arrayDays = forDays && forDays.length > 0 ? forDays : defaultArrayDays;

  const maxTimePeriod = Math.max(...arrayDays);

  const rebalances = await _getRebalances(vaultAddress, chainId, dex, maxTimePeriod);
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);
  const collectedFees = await _getFeesCollectedEvents(vaultAddress, chainId, dex, maxTimePeriod);
  if (!collectedFees) throw new Error(`Error getting vault collected fees on ${chainId} for ${vaultAddress}`);

  const result = [] as FeesInfo[];

  arrayDays.forEach((dayPeriod) => {
    const arrRebalances = rebalances
      .slice()
      .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(dayPeriod));
    const arrOtherFees = collectedFees
      .slice()
      .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(dayPeriod));
    const amount0BN = getCollectedTokenAmountBN(0, arrRebalances).add(getCollectedTokenAmountBN(0, arrOtherFees));
    const amount1BN = getCollectedTokenAmountBN(1, arrRebalances).add(getCollectedTokenAmountBN(1, arrOtherFees));
    const totalFeesAmount =
      getTotalFeesAmountInBaseTokens(arrRebalances, token0Decimals, token1Decimals, isVaultInverted) +
      getTotalFeesAmountInBaseTokens(arrOtherFees, token0Decimals, token1Decimals, isVaultInverted);
    const pct = dayPeriod !== 0 && tvl !== 0 ? (((totalFeesAmount / dayPeriod) * 365) / tvl) * 100 : 0;

    const feesCollectedInfo = {
      timePeriod: dayPeriod,
      feeAmount0: formatBigInt(amount0BN, token0Decimals),
      feeAmount1: formatBigInt(amount1BN, token1Decimals),
      pctAPR: pct,
    };
    result.push(feesCollectedInfo);
  });

  return result;
}
