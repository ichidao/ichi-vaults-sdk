/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { DepositTokenRatio, IchiVault, SupportedDex, VaultState, VaultTransactionEvent } from '../types';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { getTokenDecimals } from './_totalBalances';
import formatBigInt from '../utils/formatBigInt';
import { daysToMilliseconds } from '../utils/timestamps';
import getPrice from '../utils/getPrice';
import { getFeesAmountInBaseTokens, getTotalAmountsAtFeeCollectionEvent } from './calculateFees';
import { getCurrentDtr, getVaultTvl } from './priceFromPool';
import { _getDeposits, _getFeesCollectedEvents, _getRebalances, _getWithdraws } from './_vaultEvents';
import { getDtrAtFeeCollectionEvent, getDtrAtTransactionEvent } from './calculateDtr';

export type VaultEvent = {
  atTimestamp: string;
  dtr: number;
  tvl: number;
  feeAmount: number;
};

function formatVaultEvent(dtr: DepositTokenRatio, tvl: number, fee: number): VaultEvent {
  const ve = { atTimestamp: dtr.atTimestamp, dtr: dtr.percent, tvl, feeAmount: fee };
  return ve;
}

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

export function getTvlAtTransactionEvent(
  objTransactionEvent: VaultTransactionEvent,
  vault: IchiVault,
  token0decimals: number,
  token1decimals: number,
): number {
  const isVaultInverted = vault.allowTokenB;
  const totalAmounts = getTotalAmountsAtTransactionEvent(
    objTransactionEvent,
    isVaultInverted,
    token0decimals,
    token1decimals,
    false,
  );
  const tvl = totalAmounts[0] + totalAmounts[1];

  return tvl;
}

export function getTvlAtFeeCollectionEvent(
  objFeeCollectionEvent: VaultState,
  vault: IchiVault,
  token0decimals: number,
  token1decimals: number,
): number {
  const isVaultInverted = vault.allowTokenB;
  const totalAmounts = getTotalAmountsAtFeeCollectionEvent(
    objFeeCollectionEvent,
    isVaultInverted,
    token0decimals,
    token1decimals,
  );
  const tvl = totalAmounts[0] + totalAmounts[1];
  return tvl;
}

// time Interval in days
export async function getVaultEventsForTimeInterval(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  timeInterval: number,
): Promise<VaultEvent[]> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider, chainId);
  const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider, chainId);
  const isVaultInverted = vault.allowTokenB;

  const rebalances = await _getRebalances(vaultAddress, chainId, dex, timeInterval);
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);
  const collectedFees = await _getFeesCollectedEvents(vaultAddress, chainId, dex, timeInterval);
  if (!collectedFees) throw new Error(`Error getting vault collected fees on ${chainId} for ${vaultAddress}`);
  const deposits = await _getDeposits(vaultAddress, chainId, dex, timeInterval);
  if (!deposits) throw new Error(`Error getting vault deposits on ${chainId} for ${vaultAddress}`);
  const withdraws = await _getWithdraws(vaultAddress, chainId, dex, timeInterval);
  if (!withdraws) throw new Error(`Error getting vault withdraws on ${chainId} for ${vaultAddress}`);

  const arrRebalances = rebalances
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) =>
      formatVaultEvent(
        getDtrAtFeeCollectionEvent(e, vault.allowTokenB, token0Decimals, token1Decimals),
        getTvlAtFeeCollectionEvent(e, vault, token0Decimals, token1Decimals),
        getFeesAmountInBaseTokens(e, vault.allowTokenB, token0Decimals, token1Decimals),
      ),
    );
  const arrOtherFees = collectedFees
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) =>
      formatVaultEvent(
        getDtrAtFeeCollectionEvent(e, vault.allowTokenB, token0Decimals, token1Decimals),
        getTvlAtFeeCollectionEvent(e, vault, token0Decimals, token1Decimals),
        getFeesAmountInBaseTokens(e, vault.allowTokenB, token0Decimals, token1Decimals),
      ),
    );
  const arrDeposits = deposits
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) =>
      formatVaultEvent(
        getDtrAtTransactionEvent(e, vault.allowTokenB, token0Decimals, token1Decimals),
        getTvlAtTransactionEvent(e, vault, token0Decimals, token1Decimals),
        0,
      ),
    );
  const arrWithdraws = withdraws
    .slice()
    .filter((r) => Number(r.createdAtTimestamp) * 1000 > Date.now() - daysToMilliseconds(timeInterval))
    .map((e) =>
      formatVaultEvent(
        getDtrAtTransactionEvent(e, vault.allowTokenB, token0Decimals, token1Decimals),
        getTvlAtTransactionEvent(e, vault, token0Decimals, token1Decimals),
        0,
      ),
    );
  const currentVaultEvent = {
    atTimestamp: Math.floor(Date.now() / 1000).toString(),
    dtr: await getCurrentDtr(vaultAddress, jsonProvider, dex, isVaultInverted, token0Decimals, token1Decimals),
    tvl: await getVaultTvl(vault, jsonProvider, chainId, dex, isVaultInverted, token0Decimals, token1Decimals),
  } as VaultEvent;

  const result = [...arrDeposits, ...arrWithdraws, ...arrRebalances, ...arrOtherFees, currentVaultEvent].sort(
    (a, b) => Number(b.atTimestamp) - Number(a.atTimestamp), // recent events first, starting with current value
  );

  return result;
}
