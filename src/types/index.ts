/* eslint-disable camelcase */
/* eslint-disable no-shadow */
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

export type SignerOrProvider = Signer | Provider;

export enum SupportedChainId {
  arbitrum = 42161,
  bsc = 56,
  eon = 7332,
  evmos = 9001,
  fantom = 250,
  hedera_testnet = 296,
  linea = 59144,
  mainnet = 1,
  polygon = 137,
  zksync_era_testnet = 280,
  zksync_era = 324,
}

export enum SupportedDex {
  Ascent = 'Ascent',
  Blueprint = 'Blueprint',
  Equalizer = 'Equalizer',
  Forge = 'Forge',
  Horiza = 'Horiza',
  Lynex = 'Lynex',
  Pancakeswap = 'PancakeSwap',
  Quickswap = 'QuickSwap',
  Ramses = 'Ramses',
  Retro = 'Retro',
  SaucerSwap = 'SaucerSwap',
  Sushiswap = 'SushiSwap',
  Thena = 'Thena',
  UniswapV3 = 'Uniswap V3',
  Velocore = 'Velocore',
}

export const ichiVaultDecimals = 18;

export type TotalAmountsBN = [BigNumber, BigNumber] & { total0: BigNumber; total1: BigNumber };
export type UserAmountsBN = [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber };
export type TotalAmounts = [string, string] & { total0: string; total1: string };
export type UserAmounts = [string, string] & { amount0: string; amount1: string };

export interface IchiVault {
  id: string;
  tokenA: string;
  tokenB: string;
  allowTokenA: boolean;
  allowTokenB: boolean;
}

export interface Fees {
  feeAmount0: string;
  feeAmount1: string;
  totalAmount0: string;
  totalAmount1: string;
  createdAtTimestamp: string;
  vault: string;
  sqrtPrice: string;
}

export interface VaultTransactionEvent {
  totalAmount0: string;
  totalAmount1: string;
  totalAmount0BeforeEvent: string;
  totalAmount1BeforeEvent: string;
  createdAtTimestamp: string;
  vault: string;
  sqrtPrice: string;
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
