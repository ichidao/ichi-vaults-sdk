/* eslint-disable import/prefer-default-export */
import { SupportedDex, SupportedChainId } from '../types';

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
type dexGraph = PartialRecord<SupportedDex, string>;

// 'none' indicates that graph is not enabled on that chain
export const graphUrls: Record<SupportedChainId, dexGraph> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1',
    [SupportedDex.Ramses]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-ramses',
    [SupportedDex.Horiza]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-horiza',
    [SupportedDex.Sushiswap]: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-sushiswap',
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/mainnet-v1',
    [SupportedDex.Blueprint]: 'https://api.thegraph.com/subgraphs/name/ichi-org/mainnet-v1-blueprint',
    [SupportedDex.Pancakeswap]: 'https://api.thegraph.com/subgraphs/name/ichi-org/mainnet-v1-pancakeswap',
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1',
    [SupportedDex.Retro]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1-retro',
    [SupportedDex.Quickswap]: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1-quickswap',
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.UniswapV3]: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1',
    [SupportedDex.Pancakeswap]: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1-pancakeswap',
    [SupportedDex.Thena]: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1-thena',
  },
  [SupportedChainId.eon]: {
    [SupportedDex.Ascent]: 'none',
  },
  [SupportedChainId.hedera_testnet]: {
    [SupportedDex.SaucerSwap]: 'none',
  },
  [SupportedChainId.linea]: {
    [SupportedDex.Lynex]: 'none',
  },
  [SupportedChainId.zksync_era]: {
    [SupportedDex.Pancakeswap]: 'https://api.studio.thegraph.com/query/61136/zksync-v1-pancakeswap/version/latest',
    [SupportedDex.Velocore]: 'https://api.studio.thegraph.com/query/61136/zksync-v1-velocore/version/latest',
  },
  [SupportedChainId.zksync_era_testnet]: {
    [SupportedDex.Velocore]: 'https://api.thegraph.com/subgraphs/name/ichi-org/era-testnet-v1-velocore',
  },
};
