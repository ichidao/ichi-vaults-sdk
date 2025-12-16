import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getERC20Contract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { IchiVault, SupportedChainId, SupportedDex, ichiVaultDecimals } from '../types';
import { addressConfig } from '../utils/config/addresses';

// eslint-disable-next-line no-underscore-dangle
export async function _isVaultTokenApproved(
  accountAddress: string,
  shares: string | number | BigNumber,
  vault: IchiVault,
  chainId: SupportedChainId,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<boolean> {
  const signer = jsonProvider.getSigner(accountAddress);

  const vaultTokenContract = getERC20Contract(vault.id, signer);
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard for vault ${vault.id} not found on chain ${chainId} and dex ${dex}`);
  }
  const currentAllowanceBN = await vaultTokenContract.allowance(accountAddress, depositGuardAddress);

  const sharesBN = shares instanceof BigNumber ? shares : parseBigInt(shares, ichiVaultDecimals);

  return currentAllowanceBN.gt(BigNumber.from(0)) && currentAllowanceBN.gte(sharesBN);
}
