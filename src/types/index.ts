/* eslint-disable no-shadow */
import { Signer } from '@ethersproject/abstract-signer';
import { Provider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

export type SignerOrProvider = Signer | Provider;

export enum SupportedChainId {
  arbitrum = 42161,
  mainnet = 1,
  polygon = 137,
  bsc = 56,
}

export enum SupportedDex {
  UniswapV3,
  Retro,
  Pancakeswap,
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
