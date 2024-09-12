// eslint-disable-next-line import/no-unresolved
import { JsonRpcProvider } from '@ethersproject/providers';
import { SupportedDex } from '../types';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { getIchiVaultContract } from '../contracts';
import { getTokenDecimals } from './_totalBalances';

const univ3prices = require('@thanpolas/univ3prices');

export type VaultPositionsInfo = {
  currentTick: number;
  currentPrice: number;
  positions: {
    tickLower: number;
    tickUpper: number;
    priceLower: number;
    priceUpper: number;
  }[];
};

function getPriceAtTick(decimals: [number, number], tick: number): number {
  const price = univ3prices.tickPrice(decimals, tick);
  return price;
}

// get price at tick in deposit tokens
function getPriceInDepositToken(isVaultInverted: boolean, decimals: [number, number], tick: number): number {
  const priceFromPool = getPriceAtTick(decimals, tick);
  const result =
    (isVaultInverted && tick > 0) || (!isVaultInverted && tick < 0)
      ? Number(priceFromPool.toFixed())
      : 1 / Number(priceFromPool.toFixed());
  return result;
}

export async function getVaultPositions(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<VaultPositionsInfo> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  const decimals0 = await getTokenDecimals(vault.tokenA, jsonProvider, chainId);
  const decimals1 = await getTokenDecimals(vault.tokenB, jsonProvider, chainId);
  const tokenDecimals = [decimals0, decimals1] as [number, number];
  const isInv = vault.allowTokenB;
  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  try {
    const baseLower = await vaultContract.baseLower();
    const baseUpper = await vaultContract.baseUpper();
    const limitLower = await vaultContract.limitLower();
    const limitUpper = await vaultContract.limitUpper();
    const currentTick = await vaultContract.currentTick();
    const priceAtBaseLower = getPriceInDepositToken(isInv, tokenDecimals, baseLower);
    const priceAtBaseUpper = getPriceInDepositToken(isInv, tokenDecimals, baseUpper);
    const priceAtLimitLower = getPriceInDepositToken(isInv, tokenDecimals, limitLower);
    const priceAtLimitUpper = getPriceInDepositToken(isInv, tokenDecimals, limitUpper);
    const currentPrice = getPriceInDepositToken(isInv, tokenDecimals, currentTick);
    return {
      currentTick,
      currentPrice,
      positions: [
        {
          tickLower: baseLower,
          tickUpper: baseUpper,
          priceLower: priceAtBaseLower,
          priceUpper: priceAtBaseUpper,
        },
        {
          tickLower: limitLower,
          tickUpper: limitUpper,
          priceLower: priceAtLimitLower,
          priceUpper: priceAtLimitUpper,
        },
      ],
    };
  } catch (e) {
    console.error(`Could not get vault positions for vault ${vaultAddress} `);
    throw e;
  }
}
