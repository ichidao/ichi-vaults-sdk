/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { SupportedChainId, SupportedDex } from '../types';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';
import { getTotalAmounts } from './balances';
import getPrice from '../utils/getPrice';
import { getAlgebraPoolContract, getIchiVaultContract, getUniswapV3PoolContract } from '../contracts';
import addressConfig from '../utils/config/addresses';

export async function getSqrtPriceFromPool(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<BigNumber> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  try {
    const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
    const poolAddress: string = await vaultContract.pool();

    if (addressConfig[chainId as SupportedChainId]![dex]?.isAlgebra) {
      const poolContract = getAlgebraPoolContract(poolAddress, jsonProvider);
      const globalState = await poolContract.globalState();
      return globalState.price;
    } else {
      const poolContract = getUniswapV3PoolContract(poolAddress, jsonProvider);
      const slot0 = await poolContract.slot0();
      return slot0[0];
    }
  } catch (e) {
    console.error(`Could not get price from vault ${vaultAddress} `);
    throw e;
  }
}

// current price in pool of scarse token in deposit tokens
export async function getCurrPrice(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  isVaultInverted: boolean,
  token0decimals: number,
  token1decimals: number,
): Promise<number> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  try {
    const sqrtPrice = await getSqrtPriceFromPool(vaultAddress, jsonProvider, dex);
    const depositTokenDecimals = isVaultInverted ? token1decimals : token0decimals;
    const scarseTokenDecimals = isVaultInverted ? token0decimals : token1decimals;
    const price = getPrice(isVaultInverted, sqrtPrice, depositTokenDecimals, scarseTokenDecimals, 15);

    return price;
  } catch (e) {
    console.error(`Could not get price from vault ${vaultAddress} `);
    throw e;
  }
}

// total amounts at deposit or withdrawal in deposit tokens
export async function getCurrentDtr(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  isVaultInverted: boolean,
  token0decimals: number,
  token1decimals: number,
): Promise<number> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const totalAmounts = await getTotalAmounts(vaultAddress, jsonProvider, dex);
  const price = await getCurrPrice(vaultAddress, jsonProvider, dex, isVaultInverted, token0decimals, token1decimals);
  if ((Number(totalAmounts.total0) + Number(totalAmounts.total1) * price) === 0) return 0;
  const dtr = !isVaultInverted
    ? (Number(totalAmounts.total0) / (Number(totalAmounts.total0) + Number(totalAmounts.total1) * price)) * 100
    : (Number(totalAmounts.total1) / (Number(totalAmounts.total1) + Number(totalAmounts.total0) * price)) * 100;

  return dtr;
}

export async function getVaultTvl(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  isVaultInverted: boolean,
  token0decimals: number,
  token1decimals: number,
): Promise<number> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const totalAmounts = await getTotalAmounts(vaultAddress, jsonProvider, dex);
  const price = await getCurrPrice(vaultAddress, jsonProvider, dex, isVaultInverted, token0decimals, token1decimals);
  const tvl = !isVaultInverted
    ? Number(totalAmounts.total0) + Number(totalAmounts.total1) * price
    : Number(totalAmounts.total1) + Number(totalAmounts.total0) * price;

  return tvl;
}
