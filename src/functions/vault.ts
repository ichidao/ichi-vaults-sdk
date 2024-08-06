// eslint-disable-next-line import/no-unresolved
import { request } from 'graphql-request';
import { JsonRpcProvider } from '@ethersproject/providers';
import { SupportedDex, SupportedChainId, IchiVault } from '../types';
// eslint-disable-next-line import/no-cycle
import { VaultQueryData, VaultsByPoolQueryData, VaultsByTokensQueryData } from '../types/vaultQueryData';
import { getIchiVaultContract } from '../contracts';
import { vaultByPoolQuery, vaultByTokensQuery, vaultQuery, vaultQueryAlgebra } from '../graphql/queries';
import getGraphUrls from '../utils/getGraphUrls';
import addressConfig from '../utils/config/addresses';
import cache from '../utils/cache';

async function getVaultInfoFromContract(vaultAddress: string, jsonProvider: JsonRpcProvider): Promise<IchiVault> {
  const vault: IchiVault = {
    id: vaultAddress,
    tokenA: '',
    tokenB: '',
    allowTokenA: false,
    allowTokenB: false,
  };
  try {
    const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
    vault.tokenA = await vaultContract.token0();
    vault.tokenB = await vaultContract.token1();
    vault.allowTokenA = await vaultContract.allowToken0();
    vault.allowTokenB = await vaultContract.allowToken1();
  } catch (error) {
    throw new Error(`Could not get vault info for ${vaultAddress}`);
  }

  return vault;
}

async function sendVaultQueryRequest(url: string, vaultAddress: string, query: string): Promise<IchiVault> {
  return request<VaultQueryData, { vaultAddress: string }>(url, query, {
    vaultAddress: vaultAddress.toLowerCase(),
  }).then(({ ichiVault }) => ichiVault);
}
async function sendVaultsByTokensRequest(
  url: string,
  token1: string,
  token2: string,
  query: string,
): Promise<IchiVault[]> {
  return request<VaultsByTokensQueryData, { addressTokenA: string; addressTokenB: string }>(url, query, {
    addressTokenA: token1,
    addressTokenB: token2,
  }).then(({ ichiVaults }) => ichiVaults);
}
async function sendVaultsByPoolQueryRequest(url: string, poolAddress: string, query: string): Promise<string[]> {
  return request<VaultsByPoolQueryData, { poolAddress: string }>(url, query, {
    poolAddress: poolAddress.toLowerCase(),
  }).then(({ deployICHIVaults }) => deployICHIVaults);
}

function noHoldersCount(dex: SupportedDex, chainId: SupportedChainId): boolean {
  return (
    dex === SupportedDex.Henjin ||
    dex === SupportedDex.Thirdfy ||
    (dex === SupportedDex.Sushiswap && chainId === SupportedChainId.skale_europa) ||
    (dex === SupportedDex.Velocore && chainId === SupportedChainId.zksync_era_testnet)
  );
}

export async function getIchiVaultInfo(
  chainId: SupportedChainId,
  dex: SupportedDex,
  vaultAddress: string,
  jsonProvider?: JsonRpcProvider,
): Promise<IchiVault> {
  const key = `vault-${chainId}-${vaultAddress}`;
  const ttl = 6 * 60 * 60 * 1000; // 6 hours
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as IchiVault;
  }

  const includeHoldersCount = !noHoldersCount(dex, chainId);

  const { url, publishedUrl } = getGraphUrls(chainId, dex);
  const thisQuery = addressConfig[chainId][dex]?.isAlgebra
    ? vaultQueryAlgebra(includeHoldersCount)
    : vaultQuery(includeHoldersCount);
  if (url === 'none' && jsonProvider) {
    const result = await getVaultInfoFromContract(vaultAddress, jsonProvider);
    cache.set(key, result, ttl);
    return result;
  }
  try {
    if (publishedUrl) {
      const result = await sendVaultQueryRequest(publishedUrl, vaultAddress, thisQuery);
      cache.set(key, result, ttl);
      return result;
    }
    throw new Error(`Published URL is invalid for ${vaultAddress}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultQueryRequest(url, vaultAddress, thisQuery);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      if (jsonProvider) {
        const result = await getVaultInfoFromContract(vaultAddress, jsonProvider);
        cache.set(key, result, ttl);
        return result;
      } else {
        throw new Error(`Could not get vault info for ${vaultAddress}`);
      }
    }
  }
}

async function getVaultsByTokensAB(
  chainId: SupportedChainId,
  dex: SupportedDex,
  tokenA: string,
  tokenB: string,
): Promise<VaultsByTokensQueryData['ichiVaults']> {
  const key = `vaultByTokens-${chainId}-${tokenA}-${tokenB}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultsByTokensQueryData['ichiVaults'];
  }

  const ttl = 3600000;
  const { url, publishedUrl } = getGraphUrls(chainId, dex, true);

  try {
    if (publishedUrl) {
      const result = await sendVaultsByTokensRequest(publishedUrl, tokenA, tokenB, vaultByTokensQuery);
      cache.set(key, result, ttl);
      return result;
    } else {
      throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
    }
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultsByTokensRequest(url, tokenA, tokenB, vaultByTokensQuery);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      throw new Error(`Could not get vaults by tokens, dex ${dex} on chain ${chainId}`);
    }
  }
}

export async function getVaultsByTokens(
  chainId: SupportedChainId,
  dex: SupportedDex,
  depositTokenAddress: string,
  pairedTokenAddress: string,
): Promise<VaultsByTokensQueryData['ichiVaults']> {
  const arrVaults1 = (await getVaultsByTokensAB(chainId, dex, depositTokenAddress, pairedTokenAddress)).filter(
    (v) => v.allowTokenA,
  );
  const arrVaults2 = (await getVaultsByTokensAB(chainId, dex, pairedTokenAddress, depositTokenAddress)).filter(
    (v) => v.allowTokenB,
  );

  // eslint-disable-next-line no-return-await
  return [...arrVaults1, ...arrVaults2];
}

export async function getVaultsByPool(
  poolAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
): Promise<VaultsByPoolQueryData['deployICHIVaults']> {
  const key = `pool-${chainId}-${poolAddress}`;
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData as VaultsByPoolQueryData['deployICHIVaults'];
  }

  const { url, publishedUrl } = getGraphUrls(chainId, dex, true);
  const ttl = 3600000;

  try {
    if (publishedUrl) {
      const result = await sendVaultsByPoolQueryRequest(publishedUrl, poolAddress, vaultByPoolQuery);
      cache.set(key, result, ttl);
      return result;
    }
    throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultsByPoolQueryRequest(url, poolAddress, vaultByPoolQuery);
      cache.set(key, result, ttl);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      throw new Error(`Could not get vaults by pool ${poolAddress}`);
    }
  }
}

export async function validateVaultData(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<{ chainId: SupportedChainId; vault: IchiVault }> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);

  return { chainId, vault };
}

export async function getChainByProvider(jsonProvider: JsonRpcProvider): Promise<{ chainId: SupportedChainId }> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  return { chainId };
}
