/* eslint-disable camelcase */
/* eslint-disable no-shadow */
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

export type SignerOrProvider = Signer | Provider;

export enum SupportedChainId {
  arbitrum = 42161,
  arthera = 10242,
  arthera_testnet = 10243,
  base = 8453,
  base_sepolia = 84532,
  berachain = 80094,
  berachain_bartio = 80084,
  blast = 81457,
  blast_sepolia_testnet = 168587773,
  bsc = 56,
  celo = 42220,
  eon = 7332,
  evmos = 9001,
  fantom = 250,
  flare = 14,
  fuse = 122,
  haven1_devnet = 8110,
  hedera = 295,
  hedera_testnet = 296,
  ink = 57073,
  ink_sepolia = 763373,
  kava = 2222,
  linea = 59144,
  mainnet = 1,
  mantle = 5000,
  mode = 34443,
  polygon = 137,
  polygon_zkevm = 1101,
  real = 111188,
  rootstock = 30,
  scroll = 534352,
  skale_europa = 2046399126,
  sonic = 146,
  taiko = 167000,
  taiko_hekla = 167009,
  unreal = 18233,
  x_layer_testnet = 195,
  zircuit = 48900,
  zksync_era_testnet = 280,
  zksync_era = 324,
}

export enum SupportedDex {
  Agni = 'Agni',
  Ascent = 'Ascent',
  Blueprint = 'Blueprint',
  Cleo = 'Cleo',
  Crust = 'Crust',
  Equalizer = 'Equalizer',
  Equalizer2Thick = 'Equalizer2Thick',
  Fenix = 'Fenix',
  Forge = 'Forge',
  Henjin = 'Henjin',
  Honeypot = 'Honeypot',
  hSwap = 'hSwap',
  Kim = 'Kim',
  Kinetix = 'Kinetix',
  Kodiak = 'Kodiak',
  Linehub = 'Linehub',
  Lynex = 'Lynex',
  Metavault = 'Metavault',
  Nile = 'Nile',
  Ocelex = 'Ocelex',
  Pancakeswap = 'PancakeSwap',
  Pearl = 'Pearl',
  Quickswap = 'QuickSwap',
  Ramses = 'Ramses',
  Reservoir = 'Reservoir',
  Retro = 'Retro',
  SaucerSwap = 'SaucerSwap',
  SparkDex = 'SparkDex',
  SparkDexV1 = 'SparkDexV1',
  SpiritSwap = 'SpiritSwap',
  Sushiswap = 'SushiSwap',
  SwapX = 'SwapX',
  Thena = 'Thena',
  ThenaV3Fees = 'ThenaV3Fees',
  Thirdfy = 'Thirdfy',
  Thruster = 'Thruster',
  Trebleswap = 'Trebleswap',
  Ubeswap = 'Ubeswap',
  UniswapV3 = 'Uniswap V3',
  Velocore = 'Velocore',
  Voltage = 'Voltage',
  Wasabee = 'Wasabee',
  XSwap = 'XSwap',
}

export const ichiVaultDecimals = 18;

export type TotalAmountsBN = [BigNumber, BigNumber] & { total0: BigNumber; total1: BigNumber };
export type UserAmountsBN = [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber };
export type TotalAmounts = [string, string] & { total0: string; total1: string };
export type UserAmounts = [string, string] & { amount0: string; amount1: string };

export type UserAmountsInVault = {
  vaultAddress: string;
  userAmounts: UserAmounts;
};

export type UserAmountsInVaultBN = {
  vaultAddress: string;
  userAmounts: UserAmountsBN;
};

export interface IchiVault {
  id: string;
  tokenA: string;
  tokenB: string;
  allowTokenA: boolean;
  allowTokenB: boolean;
  holdersCount?: string;
  fee?: string;
}

export type VaultShares = {
  vault: {
    id: string;
    tokenA: string;
    tokenB: string;
  };
  vaultShareBalance: string;
};
export type UserBalances = {
  vaultShares: VaultShares[];
};

export interface VaultState {
  totalAmount0: string;
  totalAmount1: string;
  createdAtTimestamp: string;
  vault: string;
  sqrtPrice: string;
  totalSupply: string;
}

export interface Fees extends VaultState {
  feeAmount0: string;
  feeAmount1: string;
  totalAmount0: string;
  totalAmount1: string;
  createdAtTimestamp: string;
  vault: string;
  sqrtPrice: string;
  totalSupply: string;
}

export interface VaultTransactionEvent extends VaultState {
  totalAmount0: string;
  totalAmount1: string;
  totalAmount0BeforeEvent: string;
  totalAmount1BeforeEvent: string;
  createdAtTimestamp: string;
  vault: string;
  sqrtPrice: string;
  totalSupply: string;
}

export type FeesInfo = {
  timePeriod: number;
  feeAmount0: string;
  feeAmount1: string;
  pctAPR: number;
};

export type DepositTokenRatio = {
  atTimestamp: string;
  percent: number;
};

export type AverageDepositTokenRatio = {
  timePeriod: number; // in days
  percent: number;
};

export type VaultApr = {
  timeInterval: number; // in days
  apr: number | null; // percent
};

export type FeeAprData = {
  feeApr_1d: number | null;
  feeApr_3d: number | null;
  feeApr_7d: number | null;
  feeApr_30d: number | null;
};

export type PriceChange = {
  timeInterval: number; // in days
  priceChange: number | null;
};

export type UserBalanceInVault = {
  vaultAddress: string;
  shares: string;
};
export type UserBalanceInVaultBN = {
  vaultAddress: string;
  shares: BigNumber;
};

export type VaultMetrics = {
  timeInterval: number; // in days
  lpPriceChange: number | null;
  lpApr: number | null; // percent
  avgDtr: number;
  feeApr: number;
};
