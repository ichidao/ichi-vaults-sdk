import { JsonRpcProvider, ContractTransactionResponse, Overrides } from 'ethers';
import { SupportedDex, SupportedChainId } from '../types';
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
): Promise<ContractTransactionResponse> {
  const network = await jsonProvider.getNetwork();
  const chainId = Number(network.chainId) as SupportedChainId;
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // Get the vault data to find the farming contract
  const { vault } = await validateVaultData(vaultAddress, jsonProvider, dex);

  if (!vault.farmingContract || !vault.rewardTokens || vault.rewardTokens.length <= 0) {
    throw new Error(`Vault ${vaultAddress} does not have an associated farming contract or reward tokens`);
  }

  const signer = await jsonProvider.getSigner(accountAddress);
  const farmingContract = getMultiFeeDistributorContract(vault.farmingContract, signer);
  const rewardTokenAddresses = vault.rewardTokens.map((t) => t.token);

  // Estimate gas for the transaction
  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(await farmingContract.getReward.estimateGas(accountAddress, rewardTokenAddresses));

  // Execute the claim transaction
  const tx = await farmingContract.getReward(accountAddress, rewardTokenAddresses, { ...overrides, gasLimit });

  return tx;
}
