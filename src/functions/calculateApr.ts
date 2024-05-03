import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { PriceChange, SupportedChainId, SupportedDex, VaultApr, VaultState, ichiVaultDecimals } from '../types';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { getTokenDecimals } from './totalBalances';
import { getCurrLpPrice } from './priceFromPool';
import { getAllVaultEvents, getVaultStateAt } from './vaultEvents';
import { millisecondsToDays } from '../utils/timestamps';
import getPrice from '../utils/getPrice';
import { graphUrls } from '../graphql/constants';
import formatBigInt from '../utils/formatBigInt';

export function getLpPriceAt(
  vaultEvents: VaultState[],
  daysAgo: number,
  isVaultInverted: boolean,
  token0decimals: number,
  token1decimals: number,
): PriceChange | null {
  const e = getVaultStateAt(vaultEvents, daysAgo);
  if (!e) {
    return null;
  } else {
    const depositTokenDecimals = isVaultInverted ? token1decimals : token0decimals;
    const scarseTokenDecimals = isVaultInverted ? token0decimals : token1decimals;

    const { totalAmount0, totalAmount1, sqrtPrice } = e;
    const formattedTotalAmount0 = formatBigInt(totalAmount0, token0decimals);
    const formattedTotalAmount1 = formatBigInt(totalAmount1, token1decimals);
    const price = getPrice(isVaultInverted, BigNumber.from(sqrtPrice), depositTokenDecimals, scarseTokenDecimals, 15);
    const tvl = !isVaultInverted
      ? Number(formattedTotalAmount0) + Number(formattedTotalAmount1) * price
      : Number(formattedTotalAmount1) + Number(formattedTotalAmount0) * price;
    const totalSupply = Number(formatBigInt(e.totalSupply, ichiVaultDecimals));
    const days = millisecondsToDays(Date.now() - Number(e.createdAtTimestamp) * 1000);
    if (totalSupply === 0) {
      return null;
    }
    return { timeInterval: days, priceChange: tvl / totalSupply };
  }
}

export async function getLpApr(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  timeIntervals?: number[],
): Promise<(VaultApr | null)[]> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);
  if (url === 'none') throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);

  const decimals0 = await getTokenDecimals(vault.tokenA, jsonProvider);
  const decimals1 = await getTokenDecimals(vault.tokenB, jsonProvider);
  const isInv = vault.allowTokenB;

  const currLpPrice = await getCurrLpPrice(vaultAddress, jsonProvider, dex, isInv, decimals0, decimals1);

  const arrDays = timeIntervals && timeIntervals.length > 0 ? timeIntervals : [1, 7, 30];

  const result = [] as VaultApr[];
  const vaultEvents = await getAllVaultEvents(vaultAddress, jsonProvider, dex);
  arrDays.forEach((d) => {
    const objLpPrice = getLpPriceAt(vaultEvents, d, isInv, decimals0, decimals1);
    if (!objLpPrice?.priceChange) {
      result.push({ timeInterval: d, apr: null });
    } else {
      const days = objLpPrice.timeInterval;
      const apr = ((currLpPrice - objLpPrice.priceChange) / ((objLpPrice.priceChange * days) / 365)) * 100;
      result.push({ timeInterval: d, apr });
    }
  });
  return result;
}

export async function getLpPriceChange(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  timeIntervals?: number[],
): Promise<(PriceChange | null)[]> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);
  if (url === 'none') throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);

  const decimals0 = await getTokenDecimals(vault.tokenA, jsonProvider);
  const decimals1 = await getTokenDecimals(vault.tokenB, jsonProvider);
  const isInv = vault.allowTokenB;

  const currLpPrice = await getCurrLpPrice(vaultAddress, jsonProvider, dex, isInv, decimals0, decimals1);

  const arrDays = timeIntervals && timeIntervals.length > 0 ? timeIntervals : [1, 7, 30];

  const result = [] as PriceChange[];
  const vaultEvents = await getAllVaultEvents(vaultAddress, jsonProvider, dex);
  arrDays.forEach((d) => {
    const objLpPrice = getLpPriceAt(vaultEvents, d, isInv, decimals0, decimals1);
    const prevLpPrice = objLpPrice?.priceChange;
    if (!prevLpPrice || prevLpPrice === 0) {
      result.push({ timeInterval: d, priceChange: null });
    } else {
      result.push({ timeInterval: d, priceChange: ((currLpPrice - prevLpPrice) / prevLpPrice) * 100 });
    }
  });
  return result;
}
