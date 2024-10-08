import { SupportedDex, SupportedChainId } from '../../types';

export type AddressConfig = { [key in SupportedDex]?: string };

export type SupportedDexConfig = {
  factoryAddress: string;
  depositGuard: {
    address: string;
    version: number;
  };
  vaultDeployerAddress: string;
  isAlgebra: boolean;
  ammVersion?: string;
};

export type Config = { [key in SupportedDex]?: SupportedDexConfig };

const addressConfig: Record<SupportedChainId, Config> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065',
      depositGuard: {
        address: '0xFB5263779D551d0f8a85D47a7D576C4893686D12',
        version: 2,
      },
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
      isAlgebra: false,
    },
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x0aC9e4a0423eec93357e2B0F83ef8c6469FD47F7',
      depositGuard: {
        address: '0x28cF3b462a1ADdE87fe7144d110BcF0D464C97b7',
        version: 1,
      },
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
      isAlgebra: false,
    },
    [SupportedDex.Ramses]: {
      factoryAddress: '0xedAc86bc526557c422AB1F6BF848bF0da9fB44A6',
      depositGuard: {
        address: '0x2472cA62c19ab99AB9947A7754fc38945b68Fb68',
        version: 1,
      },
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
      isAlgebra: false,
    },
    [SupportedDex.Sushiswap]: {
      factoryAddress: '0xbA4c7b5eFD44Aa60da0440D0427555bdBE50e6BC',
      depositGuard: {
        address: '0xB77463Eba7f1bD5F37FCA35fdF9306B09bAa7379',
        version: 1,
      },
      isAlgebra: false,
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
    },
  },
  [SupportedChainId.arthera]: {
    [SupportedDex.Thirdfy]: {
      factoryAddress: '0x2d2c72C4dC71AA32D64e5142e336741131A73fc0',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0xd466e09be665dDb3e1B3e2631413c6fa033E0e1e',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.arthera_testnet]: {
    [SupportedDex.Thirdfy]: {
      factoryAddress: '0xbb7A3d439abf42Cf39837f9102F987bab3Ee2e73',
      depositGuard: {
        address: '0xe573920139a208989d83C57ea48837C6285F2cd3',
        version: 2,
      },
      vaultDeployerAddress: '0x21222daEcAB7E64556ADED3EE7B891742E7e766b',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x2d2c72C4dC71AA32D64e5142e336741131A73fc0',
      depositGuard: {
        address: '0x64E44525a98bC85aC097Cc6Ca4c8F6BE7D483041',
        version: 2,
      },
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
      isAlgebra: false,
    },
    [SupportedDex.Retro]: {
      factoryAddress: '0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7',
      depositGuard: {
        address: '0x9B3Ea1A39576925fA94c4BCC7eECFA0d95D331E1',
        version: 1,
      },
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
      isAlgebra: false,
    },
    [SupportedDex.Quickswap]: {
      factoryAddress: '0x11700544C577Cb543a498B27B4F0f7018BDb6E8a',
      depositGuard: {
        address: '0xDB8E25D78483D13781622A40e69a9E39A4b590B6',
        version: 1,
      },
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
      isAlgebra: true,
    },
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x5a40DFaF8C1115196A1CDF529F97122030F26112',
      depositGuard: {
        address: '0x3E1aFdB89B6Ea49e828C565ab6A36a485b7A4775',
        version: 2,
      },
      vaultDeployerAddress: '0xfF7B5E167c9877f2b9f65D19d9c8c9aa651Fe19F',
      isAlgebra: false,
    },
    [SupportedDex.Blueprint]: {
      factoryAddress: '0xEAeC81F0eD4F622D4b389672d9859166C0832b3E',
      depositGuard: {
        address: '0xC3822b5e61d6702315EFD86573978a8a3f3Acb83',
        version: 1,
      },
      vaultDeployerAddress: '0xfF7B5E167c9877f2b9f65D19d9c8c9aa651Fe19F',
      isAlgebra: false,
    },
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x8Dd50926e12BD71904bCCc6D86DFA55D42715094',
      depositGuard: {
        address: '0x81B2F475e1ca7AB6b2720AdFa2fA6D4c52C4F49d',
        version: 1,
      },
      vaultDeployerAddress: '0xfF7B5E167c9877f2b9f65D19d9c8c9aa651Fe19F',
      isAlgebra: false,
    },
  },
  [SupportedChainId.base]: {
    [SupportedDex.Equalizer]: {
      factoryAddress: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065',
      depositGuard: {
        address: '0xBf38e4Ffb0B0Aa075531b38d71d3b18a5f599819',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0xaBe5B5AC472Ead17B4B4CaC7fAF42430748ab3b3',
      depositGuard: {
        address: '0xe2381b5AFae99B899596Bc550184a080dAa31F26',
        version: 2,
      },
      vaultDeployerAddress: '0x7d11De61c219b70428Bb3199F0DD88bA9E76bfEE',
      isAlgebra: false,
    },
  },
  [SupportedChainId.berachain_bartio]: {
    [SupportedDex.Kodiak]: {
      factoryAddress: '0xCa8310832053de4909fe1A6C89C7200D033CBB76',
      depositGuard: {
        address: '0x0Dad5a47adbec92E7472F6F34AC066798dEdEE40',
        version: 2,
      },
      vaultDeployerAddress: '0x249397Aa78bE5955DBc2102DF31B3FB2A92B1AA8',
      isAlgebra: false,
    },
  },
  [SupportedChainId.blast]: {
    [SupportedDex.Fenix]: {
      factoryAddress: '0xb42D5956cDe4386B65C087CfCD16910aB6114F15',
      depositGuard: {
        address: '0xd4493957338e3f66214c733883F789b99558758F',
        version: 2,
      },
      vaultDeployerAddress: '0xaD7cf2b8ce5eB8b75dA393fc164C4F4502761379',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
    [SupportedDex.Thruster]: {
      factoryAddress: '0x2145B1CCe3A13AF4fBB14131f1F480fc121EAD93',
      depositGuard: {
        address: '0x8346A803e1754f9d4c6935aee1fd864Ff15955F1',
        version: 2,
      },
      vaultDeployerAddress: '0xaD7cf2b8ce5eB8b75dA393fc164C4F4502761379',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0xaD7cf2b8ce5eB8b75dA393fc164C4F4502761379',
      isAlgebra: false,
    },
  },
  [SupportedChainId.blast_sepolia_testnet]: {
    [SupportedDex.Fenix]: {
      factoryAddress: '0xA23A224add122F31EeD712E0C074CE0501b4CDC6',
      depositGuard: {
        address: '0x138361EA0f91CEcDe6A282089EdfEeB740076724',
        version: 2,
      },
      vaultDeployerAddress: '0x4d999694f53614de3fd6748C0f5c7f0CdC16639b',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x065356d9f628cDd1bb9F2384E2972CdAC50f51b7',
      depositGuard: {
        address: '0xa9b751f37857790D0412c81B072DB57CCc0aF545',
        version: 2,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: false,
    },
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x131c03ca881B7cC66d7a5120A9273ebf675C241D',
      depositGuard: {
        address: '0x454130394B8013D4a7288fe9Db570A0a24C606c2',
        version: 1,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: false,
    },
    [SupportedDex.Thena]: {
      factoryAddress: '0xAc93148e93d1C49D89b1166BFd74942E80F5D501',
      depositGuard: {
        address: '0xd9272a45BbF488816C6A5351894bCE7b04a66eE1',
        version: 1,
      },
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
      isAlgebra: true,
    },
  },
  [SupportedChainId.celo]: {
    [SupportedDex.Ubeswap]: {
      factoryAddress: '0x8D05f6870106707BaeCFCf5C0570DB7a583eb92A',
      depositGuard: {
        address: '0x238394541dE407Fd494e455eF17C9D991F4FBEd8',
        version: 2,
      },
      vaultDeployerAddress: '0xfAcD9c86f7766A5171bb0F9927De808929429A47',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0x62fd1824C810906F449227F1f453528bb54774C2',
        version: 2,
      },
      vaultDeployerAddress: '0xfAcD9c86f7766A5171bb0F9927De808929429A47',
      isAlgebra: false,
    },
  },
  [SupportedChainId.eon]: {
    [SupportedDex.Ascent]: {
      factoryAddress: '0x242cd12579467983dc521D8aC46EB13936ab65De',
      depositGuard: {
        address: '0xaBe5B5AC472Ead17B4B4CaC7fAF42430748ab3b3',
        version: 1,
      },
      vaultDeployerAddress: '0xB9200A707f11357D3B1cBDEbd51c8dDA84960Bde',
      isAlgebra: false,
    },
  },
  [SupportedChainId.evmos]: {
    [SupportedDex.Forge]: {
      factoryAddress: '0x7c6389714719c68caac8ae06bae6e878b3605f6d',
      depositGuard: {
        address: '0x0248b992ac2a75294b05286E9DD3A2bD3C9CFE4B',
        version: 2,
      },
      vaultDeployerAddress: '0x5BD1EC3Aba15642a25FBA7b49497b4e49Ebf9C83',
      isAlgebra: false,
    },
  },
  [SupportedChainId.fantom]: {
    [SupportedDex.Equalizer]: {
      factoryAddress: '0x932E1908461De58b0891E5022431dc995Cb95C5E',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0xE495eFdf1d19668a27042D30ee22AC3C58b6fB6c',
      isAlgebra: false,
    },
    [SupportedDex.SpiritSwap]: {
      factoryAddress: '0x89FFdaa18b296d9F0CF02fBD88e5c633FEFA5f34',
      depositGuard: {
        address: '0x02F4a98A4e59E8c7Ba3269cbcd1F1e9F3eCcfcf5',
        version: 2,
      },
      vaultDeployerAddress: '0xE495eFdf1d19668a27042D30ee22AC3C58b6fB6c',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.flare]: {
    [SupportedDex.SparkDex]: {
      factoryAddress: '0x85a4dd4ed356A7976a8302b1b690202d58583c55',
      depositGuard: {
        address: '0x4F15CED4dD9B8eF545809431c177a3ae46A29c37',
        version: 2,
      },
      vaultDeployerAddress: '0x2d1918dBa43d55B9F0E2596aecC74826BbB7d668',
      isAlgebra: false,
    },
    [SupportedDex.SparkDexV1]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0xbb7A3d439abf42Cf39837f9102F987bab3Ee2e73',
        version: 2,
      },
      vaultDeployerAddress: '0x2d1918dBa43d55B9F0E2596aecC74826BbB7d668',
      isAlgebra: false,
    },
  },
  [SupportedChainId.fuse]: {
    [SupportedDex.Voltage]: {
      factoryAddress: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065',
      depositGuard: {
        address: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
        version: 2,
      },
      vaultDeployerAddress: '0x9f99f94B6AF33a04684Ab3c9578608a2Ae1706AA',
      isAlgebra: false,
    },
  },
  [SupportedChainId.haven1_devnet]: {
    [SupportedDex.Haven1]: {
      factoryAddress: '0xbBB97d634460DACCA0d41E249510Bb741ef46ad3',
      depositGuard: {
        address: '0x0e44F5cdaBefe34d5B729acFa0a79971FFBC0E7e',
        version: 2,
      },
      vaultDeployerAddress: '0x9D821cb8b2D02115cEFe677E61582b6275770cbF',
      isAlgebra: false,
    },
  },
  [SupportedChainId.hedera]: {
    [SupportedDex.SaucerSwap]: {
      factoryAddress: '0xb62399d23d1c81f08ea445a42d7f15cc12090a71',
      depositGuard: {
        address: '0x1B0ef045830466171D617dD0F1142aD699A4Cd63',
        version: 2,
      },
      vaultDeployerAddress: '0x8514B2Fa2889F7A2f46F1AA66b514999F2a7327F',
      isAlgebra: false,
    },
  },
  [SupportedChainId.hedera_testnet]: {
    [SupportedDex.SaucerSwap]: {
      factoryAddress: '0x3DfD6dd38F055188adCb2332C2926DDA28d318bD',
      depositGuard: {
        address: '0x16Dd62dB239DF67786F0AB7596C445aCDe81a16F',
        version: 2,
      },
      vaultDeployerAddress: '0xEc7428cB95cD92e7556172FfBe735c6D48f6DEB7',
      isAlgebra: false,
    },
  },
  [SupportedChainId.kava]: {
    [SupportedDex.Kinetix]: {
      factoryAddress: '0x2d2c72C4dC71AA32D64e5142e336741131A73fc0',
      depositGuard: {
        address: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
  },
  [SupportedChainId.linea]: {
    [SupportedDex.Linehub]: {
      factoryAddress: '0xb0e7871d53BE1b1d746bBfD9511e2eF3cD70a6E7',
      depositGuard: {
        address: '0x60f50858953dBf1A699B88037D9dce235b8c505D',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
    [SupportedDex.Lynex]: {
      factoryAddress: '0x0248b992ac2a75294b05286E9DD3A2bD3C9CFE4B',
      depositGuard: {
        address: '0x57C9d919AEA56171506cfb62B60ce76be0A079DF',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: true,
    },
    [SupportedDex.Metavault]: {
      factoryAddress: '0x2592686212C164C1851dF2f62c5d5EC50600195E',
      depositGuard: {
        address: '0x92Bce3972916C2CEDA46c4EEbC9684aC26EFfe5B',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
    [SupportedDex.Nile]: {
      factoryAddress: '0xa29F3D5403D50Ea1BF597E2Ef01791A1Ce4F544E',
      depositGuard: {
        address: '0x19227E17944FAF42419F019Dcc8762C400fE50A7',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x6E3eB904966B0158833852cAFD1200c171772b53',
      depositGuard: {
        address: '0xCf99c2b3D1a9588A9a9A34eab25cD6f425FA8801',
        version: 2,
      },
      vaultDeployerAddress: '0x75178e0a2829B73E3AE4C21eE64F4B684085392a',
      isAlgebra: false,
    },
  },
  [SupportedChainId.mode]: {
    [SupportedDex.Kim]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0x2E76A8D053f839A04235341dF1f25235437fEDd6',
        version: 2,
      },
      vaultDeployerAddress: '0x124871b2FC05fD96521238cA2Bd01B770FBf1E37',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.mantle]: {
    [SupportedDex.Agni]: {
      factoryAddress: '0x92Bce3972916C2CEDA46c4EEbC9684aC26EFfe5B',
      depositGuard: {
        address: '0x2121AA95a8B05d9C1Db90368B60C6867618814b8',
        version: 2,
      },
      vaultDeployerAddress: '0xC4183bCcBa1D825A8aC971e13E698368b744F43C',
      isAlgebra: false,
    },
    [SupportedDex.Cleo]: {
      factoryAddress: '0xbBB97d634460DACCA0d41E249510Bb741ef46ad3',
      depositGuard: {
        address: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
        version: 2,
      },
      vaultDeployerAddress: '0xC4183bCcBa1D825A8aC971e13E698368b744F43C',
      isAlgebra: false,
    },
    [SupportedDex.Crust]: {
      factoryAddress: '0x797ebB6A84367B0409094FEA0D10aC7516432433',
      depositGuard: {
        address: '0x15Ea9A2a0FfBaA8Ad51a10a9bda84E60585Ba0De',
        version: 2,
      },
      vaultDeployerAddress: '0xC4183bCcBa1D825A8aC971e13E698368b744F43C',
      isAlgebra: false,
    },
  },
  [SupportedChainId.polygon_zkevm]: {
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0xe8532Db60408f2d47693dA5b9093D71580B8C23F',
      depositGuard: {
        address: '0x71338eAcdE9eF818d4F5ff979e0E727b90Dd5F59',
        version: 2,
      },
      vaultDeployerAddress: '0xCAE2d9760B852861e1A552b35e48c263047Fbc0f',
      isAlgebra: false,
    },
    [SupportedDex.Quickswap]: {
      factoryAddress: '0x1721cB3ff3cAF70a79bDE9d771B27646ed8115b1',
      depositGuard: {
        address: '0xC030BEf30EDE8ebd7Fd319361ceBa54c81754AD3',
        version: 2,
      },
      vaultDeployerAddress: '0xCAE2d9760B852861e1A552b35e48c263047Fbc0f',
      isAlgebra: true,
    },
  },
  [SupportedChainId.real]: {
    [SupportedDex.Pearl]: {
      factoryAddress: '0x860F3881aCBbF05D48a324C5b8ca9004D31A146C',
      depositGuard: {
        address: '0x89FFdaa18b296d9F0CF02fBD88e5c633FEFA5f34',
        version: 2,
      },
      vaultDeployerAddress: '0xBAd0700365De39C932b905002604B0A22aA4Bb77',
      isAlgebra: false,
    },
  },
  [SupportedChainId.rootstock]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x8cCd02E769e6A668a447Bd15e134C31bEccd8182',
      depositGuard: {
        address: '0x74C85FF93D0ff3B5E48c119390EF75A43D78d549',
        version: 2,
      },
      vaultDeployerAddress: '0x9708b4a2BDd23C8c432F04972AaDE12e4a346447',
      isAlgebra: false,
    },
  },
  [SupportedChainId.scroll]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0xb62399d23d1c81f08eA445A42d7F15cC12090A71',
        version: 2,
      },
      vaultDeployerAddress: '0x596643Ce4fe8b2e72F340584cec02Ab99dA866c1',
      isAlgebra: false,
    },
    [SupportedDex.Metavault]: {
      factoryAddress: '0xb42D5956cDe4386B65C087CfCD16910aB6114F15',
      depositGuard: {
        address: '0x131c03ca881B7cC66d7a5120A9273ebf675C241D',
        version: 2,
      },
      vaultDeployerAddress: '0x596643Ce4fe8b2e72F340584cec02Ab99dA866c1',
      isAlgebra: false,
    },
  },
  [SupportedChainId.skale_europa]: {
    [SupportedDex.Sushiswap]: {
      factoryAddress: '0x1B0ef045830466171D617dD0F1142aD699A4Cd63',
      depositGuard: {
        address: '0x860F3881aCBbF05D48a324C5b8ca9004D31A146C',
        version: 2,
      },
      vaultDeployerAddress: '0xED0A10A7db58d9dB23DDfB7EEbFE1Fe863ef67aA',
      isAlgebra: false,
    },
  },
  [SupportedChainId.taiko]: {
    [SupportedDex.Henjin]: {
      factoryAddress: '0x9FAb4bdD4E05f5C023CCC85D2071b49791D7418F',
      depositGuard: {
        address: '0x2E76A8D053f839A04235341dF1f25235437fEDd6',
        version: 2,
      },
      vaultDeployerAddress: '0xD639392f0fD8686E1739CE3E3174115e33E95a26',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.taiko_hekla]: {
    [SupportedDex.Henjin]: {
      factoryAddress: '0x7C6389714719C68cAAc8Ae06baE6E878B3605f6D',
      depositGuard: {
        address: '0xF8b3f6727e44abb211C0049FC849FbB091Ff765E',
        version: 2,
      },
      vaultDeployerAddress: '0x92403A045a2C908920D6A7FD5A5591a01dB7EE6E',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.unreal]: {
    [SupportedDex.Pearl]: {
      factoryAddress: '0x1294EC9615C91077ebdC57CfC7DDB65140750992',
      depositGuard: {
        address: '0x6DC9b390130c96b788eBEB389cb3cba992289532',
        version: 2,
      },
      vaultDeployerAddress: '0xBAd0700365De39C932b905002604B0A22aA4Bb77',
      isAlgebra: false,
    },
  },
  [SupportedChainId.x_layer_testnet]: {
    [SupportedDex.XSwap]: {
      factoryAddress: '0xADDA3A15EA71c223a82Af86d4578EF2B076035F1',
      depositGuard: {
        address: '0xe573920139a208989d83C57ea48837C6285F2cd3',
        version: 2,
      },
      vaultDeployerAddress: '0x412840Fd29A78428d3dbAeca811414c08b554599',
      isAlgebra: true,
      ammVersion: 'algebraIntegral',
    },
  },
  [SupportedChainId.zksync_era]: {
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x8a76c26E0089111989C14EF56b9733aa38B94148',
      depositGuard: {
        address: '0x5997487384CDae95E1AED6eAab1bb827180E1154',
        version: 1,
      },
      isAlgebra: false,
      vaultDeployerAddress: '0x12C1F03a443A5B893870ea6cBDb2362f666275Da',
    },
    [SupportedDex.Velocore]: {
      factoryAddress: '0x1Cd7f4a2E9e7EFb23E27CFB9eF3a2F3CFAf27675',
      depositGuard: {
        address: '0x01292A32a0b8F8f56fBb8DB90d3756a0EF06C666',
        version: 2,
      },
      vaultDeployerAddress: '0x12C1F03a443A5B893870ea6cBDb2362f666275Da',
      isAlgebra: true,
    },
  },
  [SupportedChainId.zksync_era_testnet]: {
    [SupportedDex.Velocore]: {
      factoryAddress: '0x0227f2b783b610107349da9b9DF516b8d476aB4F',
      depositGuard: {
        address: '0x7570c7b58c68d95F0663f89C228B7b13d05c15e6',
        version: 1,
      },
      vaultDeployerAddress: '0x451Efff92a3a1471b7af9DDc1369D9D157E6475A',
      isAlgebra: true,
    },
  },
};

export default addressConfig;
