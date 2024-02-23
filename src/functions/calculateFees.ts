/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Fees, FeesInfo, SupportedChainId, SupportedDex, TotalAmounts, TotalAmountsBN } from '../types';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';
import { getFeesCollectedEvents, getRebalances } from './vaultEvents';
import { getTokenDecimals } from './balances';
import formatBigInt from '../utils/formatBigInt';
import daysToMilliseconds from '../utils/timestamps';
import { isTokenAllowed } from './deposit';
import getPrice from '../utils/getPrice';
import { getVaultTvl } from './priceFromPool';

function getCollectedTokenAmountBN(ind: 0 | 1, feesDataset: Fees[]): BigNumber {
  const amounts =
    ind === 0
      ? feesDataset.map((r) => BigNumber.from(r.feeAmount0))
      : feesDataset.map((r) => BigNumber.from(r.feeAmount1));
  const amountBN = amounts.reduce((total, curr) => total.add(curr), BigNumber.from(0));
  return amountBN;
}

export function getTotalAmountsAtFeeCollectionEvent(
  objFees: Fees,
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

function getFeesAmountInBaseTokens(
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

function getTotalFeesAmountInBaseTokens(
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
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider);
  const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider);

  const numOfDays = typeof rawOrDays === 'boolean' ? days : rawOrDays;
  const rebalances = await getRebalances(vaultAddress, jsonProvider, dex, numOfDays);
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);

  const collectedFees = await getFeesCollectedEvents(vaultAddress, jsonProvider, dex, numOfDays);
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
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider);
  const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider);
  const isVaultInverted = await isTokenAllowed(1, vaultAddress, jsonProvider, dex);

  const tvl = await getVaultTvl(vaultAddress, jsonProvider, dex, isVaultInverted, token0Decimals, token1Decimals);

  const defaultArrayDays = [1, 7, 30];
  const arrayDays = forDays && forDays.length > 0 ? forDays : defaultArrayDays;

  const maxTimePeriod = Math.max(...arrayDays);

  const rebalances = await getRebalances(vaultAddress, jsonProvider, dex, maxTimePeriod);
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);
  const collectedFees = await getFeesCollectedEvents(vaultAddress, jsonProvider, dex, maxTimePeriod);
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
    const pct = (dayPeriod !== 0 && tvl !== 0) 
      ? (((totalFeesAmount / dayPeriod) * 365) / tvl) * 100 
      : 0;

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
