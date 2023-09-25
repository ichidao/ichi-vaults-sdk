import { BigNumber } from '@ethersproject/bignumber';
import { parseEther } from '@ethersproject/units';

export default function parseBigInt(_value: number | string, decimals: number): BigNumber {
  const value = Number(_value).toFixed(18);

  const bi18 = parseEther(value.toString());
  const divisor = BigNumber.from(10).pow(18 - decimals);

  return bi18.div(BigNumber.from(divisor));
}
