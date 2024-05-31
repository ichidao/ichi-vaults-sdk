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

const promises: Record<string, Promise<any>> = {};

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
function storeResult(key: string, result: any) {
  promises[key] = Promise.resolve(result);
  setTimeout(() => {
    delete promises[key];
  }, 120000); // 120000 ms = 2 minutes
}

export async function getIchiVaultInfo(
  chainId: SupportedChainId,
  dex: SupportedDex,
  vaultAddress: string,
  jsonProvider?: JsonRpcProvider,
): Promise<IchiVault> {
  const key = `${chainId + vaultAddress}-info`;

  if (Object.prototype.hasOwnProperty.call(promises, key)) {
    return promises[key];
  }
  const { url, publishedUrl } = getGraphUrls(chainId, dex);
  const thisQuery = addressConfig[chainId][dex]?.isAlgebra ? vaultQueryAlgebra : vaultQuery;
  if (url === 'none' && jsonProvider) {
    const result = await getVaultInfoFromContract(vaultAddress, jsonProvider);
    storeResult(key, result);
    return result;
  }
  try {
    if (publishedUrl) {
      const result = await sendVaultQueryRequest(publishedUrl, vaultAddress, thisQuery);
      storeResult(key, result);
      return result;
    }
    throw new Error(`Published URL is invalid for ${vaultAddress}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultQueryRequest(url, vaultAddress, thisQuery);
      storeResult(key, result);
      return result;
    } catch (error2) {
      console.error('Request to public graph URL failed:', error2);
      if (jsonProvider) {
        const result = await getVaultInfoFromContract(vaultAddress, jsonProvider);
        storeResult(key, result);
        return result;
      } else {
        throw new Error(`Could not get vault info for ${vaultAddress}`);
      }
    }
  }
}

export async function getVaultsByTokens(
  chainId: SupportedChainId,
  dex: SupportedDex,
  depositTokenAddress: string,
  pairedTokenAddress: string,
): Promise<VaultsByTokensQueryData['ichiVaults']> {
  const { url, publishedUrl } = getGraphUrls(chainId, dex, true);

  let addressTokenA = depositTokenAddress;
  let addressTokenB = pairedTokenAddress;

  const key1 = `${addressTokenA}-${addressTokenB}-${chainId}`;
  if (!Object.prototype.hasOwnProperty.call(promises, key1)) {
    try {
      if (publishedUrl) {
        const result = await sendVaultsByTokensRequest(publishedUrl, addressTokenA, addressTokenB, vaultByTokensQuery);
        storeResult(key1, result);
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        const result = await sendVaultsByTokensRequest(url, addressTokenA, addressTokenB, vaultByTokensQuery);
        storeResult(key1, result);
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get vaults by tokens, dex ${dex} on chain ${chainId}`);
      }
    }
  }

  const arrVaults1 = ((await promises[key1]) as IchiVault[]).filter((v) => v.allowTokenA);

  addressTokenA = pairedTokenAddress;
  addressTokenB = depositTokenAddress;

  const key2 = `${addressTokenA}-${addressTokenB}-${chainId}`;
  if (!Object.prototype.hasOwnProperty.call(promises, key2)) {
    try {
      if (publishedUrl) {
        const result = await sendVaultsByTokensRequest(publishedUrl, addressTokenA, addressTokenB, vaultByTokensQuery);
        storeResult(key2, result);
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        const result = await sendVaultsByTokensRequest(url, addressTokenA, addressTokenB, vaultByTokensQuery);
        storeResult(key2, result);
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get vaults by tokens, dex ${dex} on chain ${chainId}`);
      }
    }
  }

  const arrVaults2 = ((await promises[key2]) as IchiVault[]).filter((v) => v.allowTokenB);

  // eslint-disable-next-line no-return-await
  return [...arrVaults1, ...arrVaults2];
}

export async function getVaultsByPool(
  poolAddress: string,
  chainId: SupportedChainId,
  dex: SupportedDex,
): Promise<VaultsByPoolQueryData['deployICHIVaults']> {
  const { url, publishedUrl } = getGraphUrls(chainId, dex, true);

  const key = `pool-${poolAddress}-${chainId}`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  try {
    if (publishedUrl) {
      const result = await sendVaultsByPoolQueryRequest(publishedUrl, poolAddress, vaultByPoolQuery);
      storeResult(key, result);
      return result;
    }
    throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
  } catch (error) {
    if (publishedUrl) {
      console.error('Request to published graph URL failed:', error);
    }
    try {
      const result = await sendVaultsByPoolQueryRequest(url, poolAddress, vaultByPoolQuery);
      storeResult(key, result);
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
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  return { chainId, vault };
}

export async function getChainByProvider(jsonProvider: JsonRpcProvider): Promise<{ chainId: SupportedChainId }> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  return { chainId };
}
