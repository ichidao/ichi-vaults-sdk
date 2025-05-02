/* eslint-disable no-redeclare */
/* eslint-disable import/no-cycle */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getAllRewardVaults, validateVaultData } from './vault';
import { ichiVaultDecimals, SupportedDex, UserRewards, UserRewardsBN, VaultWithRewards } from '../types';
import { isVelodromeDex } from '../utils/isVelodrome';
import { getMultiFeeDistributorContract } from '../contracts';
import formatBigInt from '../utils/formatBigInt';
import { decodeFarmingRewardsResult, encodeFarmingRewardsCall, multicall } from '../utils/multicallUtils';

export async function getUserRewards(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<string>;

export async function getUserRewards(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<BigNumber>;

export async function getUserRewards(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // eslint-disable-next-line no-return-await
  const { vault } = await validateVaultData(vaultAddress, jsonProvider, dex);
  if (!vault.farmingContract) {
    return raw ? BigNumber.from(0) : '0';
  }

  const mdfContract = getMultiFeeDistributorContract(vault.farmingContract, jsonProvider);
  const rewards = await mdfContract.claimableRewards(accountAddress); // [[rewardTokens], [amounts]]

  return raw ? rewards[1][0] : formatBigInt(rewards[1][0], ichiVaultDecimals);
}

export async function getAllUserRewards(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<UserRewards[]>;

export async function getAllUserRewards(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<UserRewardsBN[]>;

export async function getAllUserRewards(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  const isVelodrome = isVelodromeDex(chainId, dex);
  if (!isVelodrome) {
    throw new Error(`This function is not supported on chain ${chainId} and dex ${dex}`);
  }

  // Get all vaults with reward contracts
  const vaults = await getAllRewardVaults(chainId, dex);

  if (vaults.length === 0) {
    return [];
  }

  // Prepare multicall to get rewards for all vaults at once
  const farmingContractCalls = vaults.map((v) => {
    return encodeFarmingRewardsCall(v.farmingContract.id, accountAddress);
  });

  // Execute multicall
  const results = await multicall(farmingContractCalls, chainId, jsonProvider);

  // Process results
  const processedResults = vaults.map((vault: VaultWithRewards, index: number) => {
    const rewards = decodeFarmingRewardsResult(results[index], vault.farmingContract.id);
    const decimals = vault.farmingContract.rewardTokenDecimals;
    const token = rewards[0][0];
    const amount = rewards[1][0];
    if (raw) {
      return {
        vaultAddress: vault.id,
        rewardToken: token,
        rewardTokenDecimals: decimals,
        rewardAmount: amount,
      };
    } else {
      return {
        vaultAddress: vault.id,
        rewardToken: token,
        rewardTokenDecimals: decimals,
        rewardAmount: formatBigInt(amount, decimals),
      };
    }
  });

  return processedResults;
}
