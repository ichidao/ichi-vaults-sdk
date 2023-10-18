import { SupportedDex, SupportedChainId } from '../../types';

export type AddressConfig = { [key in SupportedDex]?: string };

export type SupportedDexConfig = {
  factoryAddress: string;
  depositGuardAddress: string;
  vaultDeployerAddress: string;
};

export type Config = { [key in SupportedDex]?: SupportedDexConfig };

const addressConfig: Record<SupportedChainId, Config> = {
  [SupportedChainId.arbitrum]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0xfBf38920cCbCFF7268Ad714ae5F9Fad6dF607065',
      depositGuardAddress: '0x932E1908461De58b0891E5022431dc995Cb95C5E',
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
    },
    [SupportedDex.Ramses]: {
      factoryAddress: '0xedAc86bc526557c422AB1F6BF848bF0da9fB44A6',
      depositGuardAddress: '0x2472cA62c19ab99AB9947A7754fc38945b68Fb68',
      vaultDeployerAddress: '0x508C3daa571854247726ba26949f182086Ff89B0',
    },
  },
  [SupportedChainId.polygon]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x2d2c72C4dC71AA32D64e5142e336741131A73fc0',
      depositGuardAddress: '0xA5cE107711789b350e04063D4EffBe6aB6eB05a4',
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
    },
    [SupportedDex.Retro]: {
      factoryAddress: '0xb2f44D8545315cDd0bAaB4AC7233218b932a5dA7',
      depositGuardAddress: '0x9B3Ea1A39576925fA94c4BCC7eECFA0d95D331E1',
      vaultDeployerAddress: '0x0768A75F616B98ee0937673bD83B7aBF142236Ea',
    },
  },
  [SupportedChainId.mainnet]: {
    [SupportedDex.UniswapV3]: {
      factoryAddress: '0x5a40DFaF8C1115196A1CDF529F97122030F26112',
      depositGuardAddress: '0xe6e32D20258f475BaA8d0B39d4C391B96f0ef70A',
      vaultDeployerAddress: '0xfF7B5E167c9877f2b9f65D19d9c8c9aa651Fe19F',
    },
  },
  [SupportedChainId.bsc]: {
    [SupportedDex.Pancakeswap]: {
      factoryAddress: '0x131c03ca881B7cC66d7a5120A9273ebf675C241D',
      depositGuardAddress: '0x454130394B8013D4a7288fe9Db570A0a24C606c2',
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
    },
    [SupportedDex.Thena]: {
      factoryAddress: '0xAc93148e93d1C49D89b1166BFd74942E80F5D501',
      depositGuardAddress: '0xd9272a45BbF488816C6A5351894bCE7b04a66eE1',
      vaultDeployerAddress: '0x05cC3CA6E768a68A7f86b09e3ceE754437bd5f12',
    },
  },
};

export default addressConfig;
