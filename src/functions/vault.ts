// eslint-disable-next-line import/no-unresolved
import { request, gql } from 'graphql-request';
import { SupportedDex, SupportedChainId } from '../types';
import { VaultQueryData } from '../types/vaultQueryData';

const promises: Record<string, Promise<any>> = {};

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
type dexGraph = PartialRecord<SupportedDex, string>;

const urls: Record<SupportedChainId, dexGraph> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1',
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/v1',
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1',
    [SupportedDex.Retro]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1-retro',
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.Pancakeswap]: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1-pancakeswap'
  },
};

// const APP_URL = 'https://app.ichi.org';

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
