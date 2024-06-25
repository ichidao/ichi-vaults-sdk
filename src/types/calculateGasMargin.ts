import { BigNumber } from '@ethersproject/bignumber';
import { SupportedChainId } from '.';

const defaultGasLimit = 5e6;
const mantleGasLimit = 3e9;

export function getGasLimit(chainId: SupportedChainId): number {
  return chainId === SupportedChainId.mantle ? mantleGasLimit : defaultGasLimit;
}

export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000 + 2000)).div(BigNumber.from(10000));
}
