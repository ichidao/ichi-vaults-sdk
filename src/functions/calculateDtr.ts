/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import {
  AverageDepositTokenRatio,
  DepositTokenRatio,
  Fees,
  SupportedChainId,
  SupportedDex,
  VaultTransactionEvent,
} from '../types';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';
import { getDeposits, getFeesCollectedEvents, getRebalances, getWithdraws } from './vaultEvents';
import { getTokenDecimals } from './totalBalances';
import formatBigInt from '../utils/formatBigInt';
import { daysToMilliseconds } from '../utils/timestamps';
import { isTokenAllowed } from './deposit';
import getPrice from '../utils/getPrice';
import { getTotalAmountsAtFeeCollectionEvent } from './calculateFees';
import { getCurrentDtr } from './priceFromPool';

// total amounts at deposit or withdrawal in deposit tokens
function getTotalAmountsAtTransactionEvent(
  objTransactionEvent: VaultTransactionEvent,
  isVaultInverted: boolean,
  token0Decimals: number,
  token1Decimals: number,
  beforeEvent: boolean,
): [number, number] {
  const price0 = !isVaultInverted
    ? 1
    : getPrice(isVaultInverted, BigNumber.from(objTransactionEvent.sqrtPrice), token0Decimals, token1Decimals);
  const price1 = isVaultInverted
    ? 1
    : getPrice(isVaultInverted, BigNumber.from(objTransactionEvent.sqrtPrice), token0Decimals, token1Decimals);
  const amount0 = beforeEvent
    ? Number(formatBigInt(BigNumber.from(objTransactionEvent.totalAmount0BeforeEvent), token0Decimals)) * price0
    : Number(formatBigInt(BigNumber.from(objTransactionEvent.totalAmount0), token0Decimals)) * price0;
  const amount1 = beforeEvent
    ? Number(formatBigInt(BigNumber.from(objTransactionEvent.totalAmount1BeforeEvent), token1Decimals)) * price1
    : Number(formatBigInt(BigNumber.from(objTransactionEvent.totalAmount1), token1Decimals)) * price1;
  return [amount0, amount1];
}

function getDtrAtTransactionEvent(
  objTransactionEvent: VaultTransactionEvent,
  isVaultInverted: boolean,
  token0Decimals: number,
  token1Decimals: number,
  beforeEvent: boolean = false,
): DepositTokenRatio {
  const timestamp = objTransactionEvent.createdAtTimestamp;
  const totalAmounts = getTotalAmountsAtTransactionEvent(
    objTransactionEvent,
    isVaultInverted,
    token0Decimals,
    token1Decimals,
    beforeEvent,
  );
  const dtr = isVaultInverted
    ? (totalAmounts[1] / (totalAmounts[0] + totalAmounts[1])) * 100
    : (totalAmounts[0] / (totalAmounts[0] + totalAmounts[1])) * 100;
  return { atTimestamp: timestamp, percent: dtr };
}

function getDtrAtFeeCollectionEvent(
  objFeeCollectionEvent: Fees,
  isVaultInverted: boolean,
  token0Decimals: number,
  token1Decimals: number,
): DepositTokenRatio {
  const timestamp = objFeeCollectionEvent.createdAtTimestamp;
  const totalAmounts = getTotalAmountsAtFeeCollectionEvent(
    objFeeCollectionEvent,
    isVaultInverted,
    token0Decimals,
    token1Decimals,
  );
  const dtr = isVaultInverted
    ? (totalAmounts[1] / (totalAmounts[0] + totalAmounts[1])) * 100
    : (totalAmounts[0] / (totalAmounts[0] + totalAmounts[1])) * 100;
  return { atTimestamp: timestamp, percent: dtr };
}

// time Interval in days
async function getAllDtrsForTimeInterval(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  timeInterval: number,
): Promise<DepositTokenRatio[]> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider);
  const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider);
  const isVaultInverted = await isTokenAllowed(1, vaultAddress, jsonProvider, dex);

  const rebalances = await getRebalances(vaultAddress, jsonProvider, dex, timeInterval);
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);
  const collectedFees = await getFeesCollectedEvents(vaultAddress, jsonProvider, dex, timeInterval);
  if (!collectedFees) throw new Error(`Error getting vault collected fees on ${chainId} for ${vaultAddress}`);
  const deposits = await getDeposits(vaultAddress, jsonProvider, dex, timeInterval);
  if (!deposits) throw new Error(`Error getting vault deposits on ${chainId} for ${vaultAddress}`);
  const withdraws = await getWithdraws(vaultAddress, jsonProvider, dex, timeInterval);
  if (!withdraws) throw new Error(`Error getting vault withdraws on ${chainId} for ${vaultAddress}`);

  const arrRebalances = rebalances
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) => getDtrAtFeeCollectionEvent(e, isVaultInverted, token0Decimals, token1Decimals));
  const arrOtherFees = collectedFees
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) => getDtrAtFeeCollectionEvent(e, isVaultInverted, token0Decimals, token1Decimals));
  const arrDeposits = deposits
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) => getDtrAtTransactionEvent(e, isVaultInverted, token0Decimals, token1Decimals));
  const arrWithdraws = withdraws
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) => getDtrAtTransactionEvent(e, isVaultInverted, token0Decimals, token1Decimals));
  const currentDtr = {
    atTimestamp: Math.floor(Date.now() / 1000).toString(),
    percent: await getCurrentDtr(vaultAddress, jsonProvider, dex, isVaultInverted, token0Decimals, token1Decimals),
  } as DepositTokenRatio;

  const result = [...arrDeposits, ...arrWithdraws, ...arrRebalances, ...arrOtherFees, currentDtr].sort(
    (a, b) => Number(b.atTimestamp) - Number(a.atTimestamp), // recent events first, starting with current value
  );

  return result;
}

function getAverageDtr(allDtrs: DepositTokenRatio[]): number {
  if (allDtrs.length === 0) {
    return 0;
  }
  if (allDtrs.length === 1) {
    return allDtrs[0].percent; // current value
  }
  let dtrsSum = 0;
  for (let i = 0; i < allDtrs.length - 1; i += 1) {
    dtrsSum +=
      ((allDtrs[i].percent + allDtrs[i + 1].percent) / 2) *
      (Number(allDtrs[i + 1].atTimestamp) - Number(allDtrs[i].atTimestamp));
  }
  return dtrsSum / (Number(allDtrs[allDtrs.length - 1].atTimestamp) - Number(allDtrs[0].atTimestamp));
}

// timeInterval in days
export async function getAverageDepositTokenRatios(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  timeIntervals: number[] = [1, 7, 30],
): Promise<AverageDepositTokenRatio[]> {
  let forTimeIntervals = timeIntervals;
  if (timeIntervals.length === 0) {
    forTimeIntervals = [0];
  }
  const maxTimeInterval = Math.max(...forTimeIntervals);
  const allDtrs = await getAllDtrsForTimeInterval(vaultAddress, jsonProvider, dex, maxTimeInterval);
  const result = [] as AverageDepositTokenRatio[];
  forTimeIntervals.forEach((interval) => {
    const dtrsForTimeInterval =
      interval === 0
        ? [allDtrs[0]]
        : allDtrs.filter((elem) => Number(elem.atTimestamp) * 1000 >= Date.now() - daysToMilliseconds(interval));
    const averageDtr = getAverageDtr(dtrsForTimeInterval);
    result.push({ timePeriod: interval, percent: averageDtr });
  });
  return result;
}
