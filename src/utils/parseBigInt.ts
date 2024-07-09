import { BigNumber } from '@ethersproject/bignumber';

export default function parseBigInt(_value: number | string, decimals: number): BigNumber {
  const valueStr = _value.toString();

  const [wholePart, fractionalPart = ''] = valueStr.split('.');
  if (fractionalPart.length > decimals) throw new Error(`Number ${valueStr} is too long`);

  const combined = wholePart + fractionalPart.padEnd(decimals, '0');

  const bigNumberValue = BigNumber.from(combined);

  return bigNumberValue;
}
