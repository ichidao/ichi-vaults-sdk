/* eslint-disable import/prefer-default-export */
import { SupportedDex, SupportedChainId } from '../types';

type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};
type GraphQL = {
  url: string;
  publishedUrl: string;
  supportsCollectFees: boolean;
};
type dexGraph = PartialRecord<SupportedDex, GraphQL>;

// 'none' indicates that graph is not enabled on that chain
export const graphUrls: Record<SupportedChainId, dexGraph> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/arbitrum-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/HJbYWEEXe9qJ4kUrUDDwEGDjbpdABKAG2WckE4ux8maL',
      supportsCollectFees: false,
    },
    [SupportedDex.Ramses]: {
      url: 'https://api.studio.thegraph.com/query/61136/arbitrum-v1-ramses/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GSKtS4Hh76pcF94Xq9L7v9kzXRVRB8SSreqJWA5W3mmf',
      supportsCollectFees: false,
    },
    [SupportedDex.Sushiswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/arbitrum-v1-sushiswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/An7nWFghtQVc5FchQdRDNygStG5uJ698gNqySZcHLbSx',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.arthera]: {
    [SupportedDex.Thirdfy]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.arthera_testnet]: {
    [SupportedDex.Thirdfy]: {
      url: 'https://subgraph-test.arthera.net/subgraphs/name/ichifarm/thirdfy',
      publishedUrl: 'https://subgraph-test.arthera.net/subgraphs/name/ichifarm/thirdfy',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/mainnet-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/35ixPCQzgUNtc9mMZFrJnrWrqvtTxDPd9zQ4dVMjExYo',
      supportsCollectFees: false,
    },
    [SupportedDex.Blueprint]: {
      url: 'https://api.studio.thegraph.com/query/61136/mainnet-v1-blueprint/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CunP6sWwZte82UiaZEQn8ke8feNynuv3vYWZzxQ2b8eP',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/mainnet-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GspqUmutYJaCJfWk9qQ7BbvtYzaDiRDBLThMSmoBFcj9',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/polygon-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/B9uskvmXZX4MRiMQjHTqXxNcUH8thd35ouu4ht63NAFh',
      supportsCollectFees: false,
    },
    [SupportedDex.Retro]: {
      url: 'https://api.studio.thegraph.com/query/61136/polygon-v1-retro/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/APQCH4gfz9J8pVAJRfLQ6AC3Kio4RhqpgC41eNsNEscu',
      supportsCollectFees: false,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/polygon-v1-quickswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Eo8wwTjaWtYfL6jH4LGFk3o5Eg5sPDg5dKrmy8TGuL6n',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.base]: {
    [SupportedDex.Equalizer]: {
      url: 'https://api.studio.thegraph.com/query/61136/base-v1-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5H2HuQKBjXaSVTmWVYagNitiuDy7v84iXC7sqqk2P5sH',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.studio.thegraph.com/query/61136/blast-v1-fenix/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/2cJiB62w497AptncjaPsm51YHtykmEzo3191Ar2iTTB2',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/blast-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/DczT2QTQz1h1pUv4cUMTYXeQbgVrr1AwYr2vg4dP43fg',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast_sepolia_testnet]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.studio.thegraph.com/query/61136/blast-sepolia-v1-fenix/version/latest',
      publishedUrl: 'https://api.studio.thegraph.com/query/61136/blast-sepolia-v1-fenix/version/latest',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/bnb-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5uBDq4qyAHqxrYBTS7iFKE1xTXk819t4RpquTNqAEGBQ',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/bnb-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BndV5tkN9nyhaL9wiCQsAWqhtqqqhBs8QZFUUo8d6CRp',
      supportsCollectFees: false,
    },
    [SupportedDex.Thena]: {
      url: 'https://api.studio.thegraph.com/query/61136/bnb-v1-thena/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6Ki97ssSz7CEzq7mXQB8MqewpDwASAcicXg6oXbcAe84',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.celo]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/celo-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BZzMVq6HReXVBwoodyAjFNfTny2NuwUjnVuY58uT7vGQ',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.eon]: {
    [SupportedDex.Ascent]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.evmos]: {
    [SupportedDex.Forge]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.fantom]: {
    [SupportedDex.Equalizer]: {
      url: 'https://api.studio.thegraph.com/query/61136/fantom-v1-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3wmjBxJaoKC6vusByrJZcpDX2fjmEbsu3ugZ59hwLYXQ',
      supportsCollectFees: true,
    },
    [SupportedDex.SpiritSwap]: {
      url: 'https://api.studio.thegraph.com/query/61136/fantom-v1-spiritswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/HNGwhhSx8VvADhcUaQ6vpTSfdPaeLTxZjgf5BWR2oGhS',
      supportsCollectFees: true,
    },
  },
  // [SupportedChainId.hedera]: {
  //   [SupportedDex.SaucerSwap]: { url: 'none', supportsCollectFees: false },
  // },
  [SupportedChainId.hedera_testnet]: {
    [SupportedDex.SaucerSwap]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.kava]: {
    [SupportedDex.Kinetix]: {
      url: 'https://the-graph.kava.io/subgraphs/name/ichi-org/kava-v1-kinetix',
      publishedUrl: 'https://the-graph.kava.io/subgraphs/name/ichi-org/kava-v1-kinetix',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.linea]: {
    [SupportedDex.Lynex]: {
      url: 'https://api.studio.thegraph.com/query/61136/linea-v1-lynex/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/Hr9iv3AXy53vnVU4gQZvrGtp3Pzpz5pNMzJJdtFh9taW',
      supportsCollectFees: true,
    },
    [SupportedDex.Metavault]: {
      url: 'https://api.studio.thegraph.com/query/61136/linea-v1-metavault/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CW4wL8snqnUg7aZwvPFBuVJjmRRd7ukWZiFFxQ6qH4dG',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/linea-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6PLcFmVCMoqu71tXJvjaW1czgvtDyLGzU3622YEhdkJr',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.mantle]: {
    [SupportedDex.Cleo]: {
      url: 'https://subgraph-api.mantle.xyz/subgraphs/name/ichi-org/mantle-v1-cleo',
      publishedUrl: 'https://subgraph-api.mantle.xyz/subgraphs/name/ichi-org/mantle-v1-cleo',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.polygon_zkevm]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/zkevm-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/B3R76fRBFf39PjqnxH1urJ8tQRtkFab4UpK6HZN8ErzB',
      supportsCollectFees: true,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/zkevm-v1-quickswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GdAYLjNLKDmdXKrHbZzYcLs85cWpgVug4DPPmskLMcey',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.scroll]: {
    [SupportedDex.Metavault]: {
      url: 'https://api.studio.thegraph.com/query/61136/scroll-v1-metavault/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/7W9m4cYsnrAkAuXoyqGxCYjBTM7vAAQ1ogxfR4VJf8Ga',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/61136/scroll-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/7BxUZZoz7ngExxf9C7Hzohxu3MBxpjJvYA8ThJhe8Snt',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.taiko_hekla]: {
    [SupportedDex.Henjin]: {
      url: 'https://api.goldsky.com/api/public/project_clvwe2yydw1n701uh6yple20i/subgraphs/ichi-subgraph/1.0.0/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clvwe2yydw1n701uh6yple20i/subgraphs/ichi-subgraph/1.0.0/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.x_layer_testnet]: {
    [SupportedDex.XSwap]: {
      url: 'https://api.studio.thegraph.com/query/61136/xlayer-sepolia-v1-xswap/version/latest',
      publishedUrl: 'https://api.studio.thegraph.com/query/61136/xlayer-sepolia-v1-xswap/version/latest',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.zksync_era]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/61136/zksync-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/J11rANzPQ2WPE4zHu4yFUyLyH9Ze3HRgVPdRer1rwFZb',
      supportsCollectFees: true,
    },
    [SupportedDex.Velocore]: {
      url: 'https://api.studio.thegraph.com/query/61136/zksync-v1-velocore/version/latest',
      publishedUrl: 'https://api.studio.thegraph.com/query/61136/zksync-v1-velocore/version/latest',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.zksync_era_testnet]: {
    [SupportedDex.Velocore]: {
      url: 'https://api.thegraph.com/subgraphs/name/ichi-org/era-testnet-v1-velocore',
      publishedUrl: 'https://api.thegraph.com/subgraphs/name/ichi-org/era-testnet-v1-velocore',
      supportsCollectFees: true,
    },
  },
};
