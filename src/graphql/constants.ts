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
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/EHrAjHvipRZ6oUpdxjMMQmmtTBGEgTeLfAbcGmwDP5MS',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5LbeEUUQSCgL9H4H1YqF6ef71z2BFnEYdkJF7ETPby6H',
      supportsCollectFees: true,
    },
    [SupportedDex.Ramses]: {
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1-ramses/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GUje3ta3bDgpyT5pUzhpuxZJetRMhYHSuBdbLC6aKh7u',
      supportsCollectFees: false,
    },
    [SupportedDex.Sushiswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/arbitrum-v1-sushiswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/9LLNtWuxZC8CJ8VKNXFonZTfCZ2dkNFQ75WfAjjG5tWu',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.arthera]: {
    [SupportedDex.Thirdfy]: {
      url: 'https://subgraph.arthera.net/subgraphs/name/ichifarm/thirdfy',
      publishedUrl: 'https://subgraph.arthera.net/subgraphs/name/ichifarm/thirdfy',
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
      url: 'https://api.studio.thegraph.com/query/88584/mainnet-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/rsoxiRb9Ps8nd7FheU2QGeWVhTALCQjUZeUv8pS93gt',
      supportsCollectFees: false,
    },
    [SupportedDex.Blueprint]: {
      url: 'https://api.studio.thegraph.com/query/88584/mainnet-v1-blueprint/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/DZ7m2Dr1ZVkeQMgi1LDLwKSCvscEUteGSKbAmcspF68G',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/mainnet-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GtYgZPoaEtbiajpAEZCGk9Z6MGHFmXeNyvnG5voF5AuS',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/polygon-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6WH2uyXvDZByPEBQ46mieAgvyS9ELiuGXfffyGKbw1Qf',
      supportsCollectFees: false,
    },
    [SupportedDex.Retro]: {
      url: 'https://api.studio.thegraph.com/query/88584/polygon-v1-retro/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/5WyaMUnnbvGWkzpGyWNETNhgPgohtmV8wFn7Bn7akcUj',
      supportsCollectFees: false,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/polygon-v1-quickswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CbYdVpAtj6bU1jcb7FcEWn2ydLdVNhwRy1c7C2XGrNa9',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.base]: {
    [SupportedDex.Equalizer]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/FeWJod9KKVkeRrC7MB54cJNu9qYhoyNzDYPa8D62U2AS',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/base-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/2RW5ke8ps9rAjPaAxxQpe8rFexLWWMLL5ySzwLZPnG6g',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.berachain_bartio]: {
    [SupportedDex.Kodiak]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/berachain-bartio-v1-kodiak/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/berachain-bartio-v1-kodiak/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/blast-v1-fenix/1.0.0/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/blast-v1-fenix/1.0.0/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Thruster]: {
      url: 'https://api.studio.thegraph.com/query/88584/blast-v1-thruster/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/JDXqs18mzaghk5kZRTRLtQZAMkrqhfYk1LJagcAgHwPc',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/blast-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/2WUyxDQ824jLYkQ53JXMByumvXVgTeJcLD6XezRr9QgV',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.blast_sepolia_testnet]: {
    [SupportedDex.Fenix]: {
      url: 'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/blast-sepolia-v1-fenix/1.0.0/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clxadvm41bujy01ui2qalezdn/subgraphs/blast-sepolia-v1-fenix/1.0.0/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/bnb-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/A5d7JgbjDdfD2iSgArqdBUQubFEWHG264vCZuqWBiJDU',
      supportsCollectFees: false,
    },
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/bnb-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/GC3MXRrHoAvHKpMt1GZf6K9PMHTeTfpZZWPisMJdBEJs',
      supportsCollectFees: false,
    },
    [SupportedDex.Thena]: {
      url: 'https://api.studio.thegraph.com/query/88584/bnb-v1-thena/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6x5DWy8Tnber9jND8qbxjtCtus11tkkjd6r2qJphoLvf',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.celo]: {
    [SupportedDex.Ubeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/celo-v1-ubeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/8N5VoyCYnFxFVLiMgNWXR9dMtcRrTRC1DjHwNeq5DzNY',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/celo-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/7dD1q2C5qCXmQpGCgnUsHmFaufD9c9qfppNoeEjEfkLm',
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
      url: 'https://api.studio.thegraph.com/query/88584/fantom-v1-equalizer/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/sB5joTEeHxm7ab61PTbGsrqMpkdsFeMdiwjsURXWXcY',
      supportsCollectFees: true,
    },
    [SupportedDex.SpiritSwap]: {
      url: 'https://api.studio.thegraph.com/query/88584/fantom-v1-spiritswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/62EgsMcsvnSR2vUbS2c6u1Au3janYYtuKFhd3D2NkyMd',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.flare]: {
    [SupportedDex.SparkDex]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v2-sparkdex/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v2-sparkdex/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.SparkDexV1]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v1-sparkdex/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/flare-v1-sparkdex/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.fuse]: {
    [SupportedDex.Voltage]: {
      url: 'https://api.studio.thegraph.com/query/88584/fuse-v1-voltage/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3vPXgLUrHhG6tRs6YoT7656UQXSa2dN6breZt9P8TfsQ',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.haven1_devnet]: {
    [SupportedDex.Haven1]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.hedera]: {
    [SupportedDex.SaucerSwap]: {
      url: 'https://mainnet-thegraph.swirldslabs.com/subgraphs/name/ichi-org/hedera-v1-saucerswap',
      publishedUrl: 'https://mainnet-thegraph.swirldslabs.com/subgraphs/name/ichi-org/hedera-v1-saucerswap',
      supportsCollectFees: true,
    },
  },
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
    [SupportedDex.Linehub]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-linehub/v0.0.3',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/T2KQrNBqn6Et7xEjDAhMrvb9aJBYnHqmQhimbauYW9E',
      supportsCollectFees: true,
    },
    [SupportedDex.Lynex]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-lynex/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BXngwuUh7YYXg9QY2bFW5tqhuG2okNgczm1utfpEyCX9',
      supportsCollectFees: true,
    },
    [SupportedDex.Metavault]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-metavault/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/CVBmJy2wVp3NPZQRzwHjboNyfVKsp2jaQoXZbFx1rR2A',
      supportsCollectFees: true,
    },
    [SupportedDex.Nile]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1-nile/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3vrWez6BeB5jnvzXh9Vs9rbUSWmSKNbwDTcnuHQTbehu',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/linea-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3FDwqSf1ftVtvDiTZExGZut3TPJKVx74htgPL2cuWh7g',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.mantle]: {
    [SupportedDex.Agni]: {
      url: 'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-agni/v0.0.2/gn',
      publishedUrl:
        'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-agni/v0.0.2/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Cleo]: {
      url: 'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-cleo/v0.0.2/gn',
      publishedUrl:
        'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-cleo/v0.0.2/gn',
      supportsCollectFees: true,
    },
    [SupportedDex.Crust]: {
      url: 'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-crust/v0.0.2/gn',
      publishedUrl:
        'https://subgraph-api.mantle.xyz/api/public/0adbe4aa-15df-48ae-aead-f7a80732986d/subgraphs/ichi-org/mantle-v1-crust/v0.0.2/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.mode]: {
    [SupportedDex.Kim]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/mode-v1-kim/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/mode-v1-kim/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.polygon_zkevm]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/zkevm-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/6suvZcqmzNcrr6ewVwjeMtq2vNsZ6Z7pL3dVjWvDF96f',
      supportsCollectFees: true,
    },
    [SupportedDex.Quickswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/zkevm-v1-quickswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/4LAUjmgShgrvFFv7W9zPRKKDqLeSHMp1BMtPeR7cfBHt',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.real]: {
    [SupportedDex.Pearl]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/real-v1-pearl/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/real-v1-pearl/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.rootstock]: {
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/rootstock-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/BAvYHGJeD743cE3eg3UXYmjuEjtz72CCJ94Vp1zbFHhY',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.scroll]: {
    [SupportedDex.Metavault]: {
      url: 'https://api.studio.thegraph.com/query/88584/scroll-v1-metavault/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/J9ftF7FnUTbLDxxTXza1ekix2w39dspgpiFiquRK1qL',
      supportsCollectFees: true,
    },
    [SupportedDex.UniswapV3]: {
      url: 'https://api.studio.thegraph.com/query/88584/scroll-v1/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/3LqDsCLFLTTkwSfoCNVuHufLBeWyogSb1fZYicPmjron',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.skale_europa]: {
    [SupportedDex.Sushiswap]: {
      url: 'https://elated-tan-skat-graph.skalenodes.com:8000/subgraphs/name/ichi-org/skale-europa-v1-sushiswap',
      publishedUrl:
        'https://elated-tan-skat-graph.skalenodes.com:8000/subgraphs/name/ichi-org/skale-europa-v1-sushiswap',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.taiko]: {
    [SupportedDex.Henjin]: {
      url: 'https://api.goldsky.com/api/public/project_clvwe2yydw1n701uh6yple20i/subgraphs/henjin-ichi/1.0.0/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clvwe2yydw1n701uh6yple20i/subgraphs/henjin-ichi/1.0.0/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.taiko_hekla]: {
    [SupportedDex.Henjin]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.unreal]: {
    [SupportedDex.Pearl]: {
      url: 'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/unreal-v1-pearl/gn',
      publishedUrl:
        'https://api.goldsky.com/api/public/project_clynrq1h8gam301xx6vgngo9p/subgraphs/ichi-org/unreal-v1-pearl/gn',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.x_layer_testnet]: {
    [SupportedDex.XSwap]: {
      url: 'https://api.studio.thegraph.com/query/88584/xlayer-sepolia-v1-xswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/EsPs6Mz2akM2Hbqm66jTb4YrnW1cjHVDnoqcJV2Xvitt',
      supportsCollectFees: true,
    },
  },
  [SupportedChainId.zksync_era]: {
    [SupportedDex.Pancakeswap]: {
      url: 'https://api.studio.thegraph.com/query/88584/zksync-v1-pancakeswap/version/latest',
      publishedUrl:
        'https://gateway-arbitrum.network.thegraph.com/api/[api-key]/subgraphs/id/HRoLbVrr8T8zCbC769cMseTpHq9Ebnqv5fKaJKJ4qkYc',
      supportsCollectFees: true,
    },
    [SupportedDex.Velocore]: {
      url: 'https://api.studio.thegraph.com/query/88584/zksync-v1-velocore/version/latest',
      publishedUrl: 'https://api.studio.thegraph.com/query/88584/zksync-v1-velocore/version/latest',
      supportsCollectFees: false,
    },
  },
  [SupportedChainId.zksync_era_testnet]: {
    [SupportedDex.Velocore]: {
      url: 'none',
      publishedUrl: 'none',
      supportsCollectFees: true,
    },
  },
};
