// eslint-disable-next-line import/no-unresolved
import { request, gql } from 'graphql-request';
import { SupportedDex, SupportedChainId, IchiVault } from '../types';
// eslint-disable-next-line import/no-cycle
import { VaultQueryData, VaultsByTokensQueryData } from '../types/vaultQueryData';

const promises: Record<string, Promise<any>> = {};

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
type dexGraph = PartialRecord<SupportedDex, string>;

const urls: Record<SupportedChainId, dexGraph> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1',
    [SupportedDex.Ramses]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-ramses',
    [SupportedDex.Horiza]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-horiza',
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/mainnet-v1',
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1',
    [SupportedDex.Retro]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1-retro',
    [SupportedDex.Quickswap]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1-quickswap',
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.Pancakeswap]: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1-pancakeswap',
    [SupportedDex.Thena]: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1-thena',
  },
};

const vaultQuery = gql`
  query ($vaultAddress: String!) {
    ichiVault(id: $vaultAddress) {
      id
      tokenA
      tokenB
      allowTokenA
      allowTokenB
    }
  }
`;

const vaultByTokensQuery = gql`
  query ($addressTokenA: String!, $addressTokenB: String!) {
    ichiVaults(where: { tokenA: $addressTokenA, tokenB: $addressTokenB }) {
      id
      tokenA
      tokenB
      allowTokenA
      allowTokenB
    }
  }
`;

// eslint-disable-next-line import/prefer-default-export
export async function getIchiVaultInfo(
  chainId: SupportedChainId,
  dex: SupportedDex,
  vaultAddress: string,
): Promise<VaultQueryData['ichiVault']> {
  const key = `${chainId + vaultAddress}-info`;

  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const url = urls[chainId]![dex];
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);

  promises[key] = request<VaultQueryData, { vaultAddress: string }>(url, vaultQuery, {
    vaultAddress,
  })
    .then(({ ichiVault }) => ichiVault)
    .finally(() => setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */));

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
