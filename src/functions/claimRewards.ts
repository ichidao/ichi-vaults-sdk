import { JsonRpcProvider } from '@ethersproject/providers';
import { ContractTransaction, Overrides } from 'ethers';
import { SupportedDex } from '../types';
import { isVelodromeDex } from '../utils/isVelodrome';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { getMultiFeeDistributorContract } from '../contracts';
import { calculateGasMargin } from '../types/calculateGasMargin';

/**
 * Claims rewards from the farming contract associated with a vault
 *
 * @param accountAddress - The address of the account claiming rewards
 * @param vaultAddress - The address of the vault
 * @param jsonProvider - The JSON RPC provider
 * @param dex - The DEX to use
 * @param overrides - Optional transaction overrides
 * @returns The transaction
 */
// eslint-disable-next-line import/prefer-default-export
export async function claimRewards(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId } = await jsonProvider.getNetwork();
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // Get the vault data to find the farming contract
  const { vault } = await validateVaultData(vaultAddress, jsonProvider, dex);

  if (!vault.farmingContract || !vault.rewardToken) {
    throw new Error(`Vault ${vaultAddress} does not have an associated farming contract`);
  }

  const signer = jsonProvider.getSigner(accountAddress);
  const farmingContract = getMultiFeeDistributorContract(vault.farmingContract, signer);

  // Estimate gas for the transaction
  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(await farmingContract.estimateGas.getReward(accountAddress, [vault.rewardToken]));

  // Execute the claim transaction
  const tx = await farmingContract.getReward(accountAddress, [vault.rewardToken], { ...overrides, gasLimit });

  return tx;
}
