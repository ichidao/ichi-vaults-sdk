// eslint-disable-next-line import/no-unresolved
import { request, gql } from 'graphql-request';
import { JsonRpcProvider } from '@ethersproject/providers';
import { SupportedDex, SupportedChainId, IchiVault } from '../types';
// eslint-disable-next-line import/no-cycle
import { VaultQueryData, VaultsByTokensQueryData } from '../types/vaultQueryData';
import { getIchiVaultContract } from '../contracts';
import { urls } from '../graphql/constants';
import { vaultByTokensQuery, vaultQuery } from '../graphql/queries';

const promises: Record<string, Promise<any>> = {};

async function getVaultInfoFromContract(vaultAddress: string, jsonProvider: JsonRpcProvider): Promise<IchiVault> {
  const vault: IchiVault = {
    id: vaultAddress,
    tokenA: '',
    tokenB: '',
    allowTokenA: false,
    allowTokenB: false,
  };
  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  vault.tokenA = await vaultContract.token0();
  vault.tokenB = await vaultContract.token1();
  vault.allowTokenA = await vaultContract.allowToken0();
  vault.allowTokenB = await vaultContract.allowToken1();

  return vault;
}

// eslint-disable-next-line import/prefer-default-export
export async function getIchiVaultInfo(
  chainId: SupportedChainId,
  dex: SupportedDex,
  vaultAddress: string,
  jsonProvider?: JsonRpcProvider,
): Promise<VaultQueryData['ichiVault']> {
  const key = `${chainId + vaultAddress}-info`;

  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const url = urls[chainId]![dex];
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);
  if (url === 'none' && jsonProvider) {
    promises[key] = getVaultInfoFromContract(vaultAddress, jsonProvider);
  } else {
    promises[key] = request<VaultQueryData, { vaultAddress: string }>(url, vaultQuery, {
      vaultAddress: vaultAddress.toLowerCase(),
    })
      .then(({ ichiVault }) => ichiVault)
      .catch((err) => {
        console.error(err);
        if (jsonProvider) {
          promises[key] = getVaultInfoFromContract(vaultAddress, jsonProvider);
        }
      })
      .finally(() => setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */));
  }

  // eslint-disable-next-line no-return-await
  return await promises[key];
}

export async function getVaultsByTokens(
  chainId: SupportedChainId,
  dex: SupportedDex,
  depositTokenAddress: string,
  pairedTokenAddress: string,
): Promise<VaultsByTokensQueryData['ichiVaults']> {
  const url = urls[chainId]![dex];
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);
  if (url === 'none') throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);

  let addressTokenA = depositTokenAddress;
  let addressTokenB = pairedTokenAddress;

  const key1 = `${addressTokenA}-${addressTokenB}`;
  if (Object.prototype.hasOwnProperty.call(promises, key1)) return promises[key1];

  promises[key1] = request<VaultsByTokensQueryData, { addressTokenA: string; addressTokenB: string }>(
    url,
    vaultByTokensQuery,
    {
      addressTokenA,
      addressTokenB,
    },
  )
    .then(({ ichiVaults }) => ichiVaults)
    .finally(() => setTimeout(() => delete promises[key1], 2 * 60 * 100 /* 2 mins */));

  const arrVaults1 = ((await promises[key1]) as any[]).filter((v) => (v as IchiVault).allowTokenA);

  addressTokenA = pairedTokenAddress;
  addressTokenB = depositTokenAddress;

  const key2 = `${addressTokenA}-${addressTokenB}`;
  if (Object.prototype.hasOwnProperty.call(promises, key2)) return promises[key2];

  promises[key2] = request<VaultsByTokensQueryData, { addressTokenA: string; addressTokenB: string }>(
    url,
    vaultByTokensQuery,
    {
      addressTokenA,
      addressTokenB,
    },
  )
    .then(({ ichiVaults }) => ichiVaults)
    .finally(() => setTimeout(() => delete promises[key2], 2 * 60 * 100 /* 2 mins */));

  const arrVaults2 = ((await promises[key2]) as any[]).filter((v) => (v as IchiVault).allowTokenB);

  // eslint-disable-next-line no-return-await
  return [...arrVaults1, ...arrVaults2];
}
