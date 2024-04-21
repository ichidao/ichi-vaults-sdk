/* eslint-disable import/prefer-default-export */
import { SupportedDex, SupportedChainId } from '../types';

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
type GraphQL = { url: string; supportsCollectFees: boolean };
type dexGraph = PartialRecord<SupportedDex, GraphQL>;

// 'none' indicates that graph is not enabled on that chain
export const graphUrls: Record<SupportedChainId, dexGraph> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1',
      supportsCollectFees: false,
    },
    [SupportedDex.Ramses]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-ramses',
      supportsCollectFees: false,
    },
    [SupportedDex.Horiza]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-horiza',
      supportsCollectFees: false,
    },
    [SupportedDex.Sushiswap]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/arbitrum-v1-sushiswap',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/mainnet-v1',
      supportsCollectFees: false,
    },
    [SupportedDex.Blueprint]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/mainnet-v1-blueprint',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/mainnet-v1-pancakeswap',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1',
      supportsCollectFees: false,
    },
    [SupportedDex.Retro]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1-retro',
      supportsCollectFees: false,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/polygon-v1-quickswap',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.base]: {
    [SupportedDex.Equalizer]: {
      url: 'https://api.studio.thegraph.com/query/61136/base-v1-equalizer/version/latest',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.studio.thegraph.com/query/61136/blast-v1-fenix/version/latest',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/blast-v1/version/latest',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast_sepolia_testnet]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.studio.thegraph.com/query/61136/blast-sepolia-v1-fenix/version/latest',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1-pancakeswap',
      supportsCollectFees: false,
    },
    [SupportedDex.Thena]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/bnb-v1-thena',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.celo]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/celo-v1',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.eon]: {
    [SupportedDex.Ascent]: { url: 'none', supportsCollectFees: false },
  },
  [SupportedChainId.evmos]: {
    [SupportedDex.Forge]: { url: 'none', supportsCollectFees: false },
  },
  [SupportedChainId.fantom]: {
    [SupportedDex.Equalizer]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/fantom-v1-equalizer',
      supportsCollectFees: true,
    },
  },
  // [SupportedChainId.hedera]: {
  //   [SupportedDex.SaucerSwap]: { url: 'none', supportsCollectFees: false },
  // },
  [SupportedChainId.hedera_testnet]: {
    [SupportedDex.SaucerSwap]: { url: 'none', supportsCollectFees: false },
  },
  [SupportedChainId.linea]: {
    [SupportedDex.Lynex]: {
      url: 'https://api.studio.thegraph.com/query/61136/linea-v1-lynex/version/latest',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.mantle]: {
    [SupportedDex.Cleo]: {
      url: 'https://subgraph-api.mantle.xyz/subgraphs/name/ichi-org/mantle-v1-cleo',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.polygon_zkevm]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/zkevm-v1-pancakeswap/version/latest',
      supportsCollectFees: true,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/zkevm-v1-quickswap/version/latest',
      supportsCollectFees: true,
    },
    [SupportedDex.Zero]: {
      url: 'https://api.studio.thegraph.com/query/61136/zkevm-v1-zero/version/latest',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.scroll]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/scroll-v1/version/latest',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.zksync_era]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/zksync-v1-pancakeswap/version/latest',
      supportsCollectFees: true,
    },
    [SupportedDex.Velocore]: {
      url: 'https://api.studio.thegraph.com/query/61136/zksync-v1-velocore/version/latest',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.zksync_era_testnet]: {
    [SupportedDex.Velocore]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/era-testnet-v1-velocore',
      supportsCollectFees: true,
    },
  },
};
