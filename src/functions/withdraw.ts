/* eslint-disable import/prefer-default-export */

import { ContractTransaction, Overrides } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getIchiVaultContract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { SupportedChainId, SupportedDex } from '../types';
import calculateGasMargin from '../types/calculateGasMargin';
import { getIchiVaultInfo } from './vault';

export async function withdraw(
  accountAddress: string,
  shares: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = jsonProvider.network;

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const signer = jsonProvider.getSigner(accountAddress);

  const vaultContract = getIchiVaultContract(vaultAddress, signer);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress);
  if (!vault) throw new Error(`Vault not found [${chainId}, ${vaultAddress}]`);

  const params: Parameters<typeof vaultContract.withdraw> = [
    shares instanceof BigNumber ? shares : parseBigInt(shares, 18),
    accountAddress,
  ];

  const gasLimit = overrides?.gasLimit ?? calculateGasMargin(await vaultContract.estimateGas.withdraw(...params));

  params[2] = { ...overrides, gasLimit };

  return vaultContract.withdraw(...params);
}
