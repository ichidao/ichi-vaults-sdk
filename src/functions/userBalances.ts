/* eslint-disable no-redeclare */
/* eslint-disable import/prefer-default-export */

import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
// eslint-disable-next-line import/no-unresolved
import { request } from 'graphql-request';
import { getERC20Contract, getIchiVaultContract } from '../contracts';
import {
  SupportedChainId,
  SupportedDex,
  UserAmounts,
  UserAmountsBN,
  UserAmountsInVault,
  UserAmountsInVaultBN,
  UserBalanceInVault,
  UserBalanceInVaultBN,
  UserBalances,
  ichiVaultDecimals,
} from '../types';
import formatBigInt from '../utils/formatBigInt';
// eslint-disable-next-line import/no-cycle
import { getIchiVaultInfo } from './vault';
import { getTokenDecimals, getTotalAmounts } from './totalBalances';
import { graphUrls } from '../graphql/constants';
import { UserBalancesQueryData } from '../types/vaultQueryData';
import { userBalancesQuery } from '../graphql/queries';
import parseBigInt from '../utils/parseBigInt';

const promises: Record<string, Promise<any>> = {};

export async function getUserBalance(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<string>;

export async function getUserBalance(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<BigNumber>;

export async function getUserBalance(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const shares = await vaultContract.balanceOf(accountAddress);

  return raw ? shares : formatBigInt(shares, ichiVaultDecimals);
}

export async function getAllUserBalances(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<UserBalanceInVault[]>;

export async function getAllUserBalances(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<UserBalanceInVaultBN[]>;

export async function getAllUserBalances(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }
  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`This function is unsupported for DEX ${dex} on chain ${chainId}`);

  let shares: UserBalanceInVault[];
  const key = `${chainId + accountAddress}-balances`;
  if (!Object.prototype.hasOwnProperty.call(promises, key)) {
    promises[key] = request<UserBalancesQueryData, { accountAddress: string }>(url, userBalancesQuery, {
      accountAddress: accountAddress.toLowerCase(),
    })
      .then(({ user }) => user)
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */));
  }

  const balances = await promises[key];
  if (balances) {
    const userBalances = (balances as UserBalances).vaultShares;
    shares = userBalances.map((balance) => {
      return { vaultAddress: balance.vault.id, shares: balance.vaultShareBalance };
    });
    return raw
      ? shares.map((s) => {
          return { vaultAddress: s.vaultAddress, shares: parseBigInt(s.shares, ichiVaultDecimals) };
        })
      : shares;
  } else {
    return [];
  }
}

export async function getUserAmounts(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<UserAmounts>;

export async function getUserAmounts(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<UserAmountsBN>;

export async function getUserAmounts(
  accountAddress: string,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  const vaultContract = getIchiVaultContract(vaultAddress, jsonProvider);
  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const totalAmountsBN = await getTotalAmounts(vaultAddress, jsonProvider, dex, true);
  const totalSupplyBN = await vaultContract.totalSupply();
  const userBalanceBN = await getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  if (!totalSupplyBN.isZero()) {
    const userAmountsBN = {
      amount0: userBalanceBN.mul(totalAmountsBN[0]).div(totalSupplyBN),
      amount1: userBalanceBN.mul(totalAmountsBN[1]).div(totalSupplyBN),
      0: userBalanceBN.mul(totalAmountsBN[0]).div(totalSupplyBN),
      1: userBalanceBN.mul(totalAmountsBN[1]).div(totalSupplyBN),
    } as UserAmountsBN;
    if (!raw) {
      const token0Decimals = await getTokenDecimals(vault.tokenA, jsonProvider);
      const token1Decimals = await getTokenDecimals(vault.tokenB, jsonProvider);
      const userAmounts = {
        amount0: formatBigInt(userAmountsBN.amount0, token0Decimals),
        amount1: formatBigInt(userAmountsBN.amount1, token1Decimals),
        0: formatBigInt(userAmountsBN.amount0, token0Decimals),
        1: formatBigInt(userAmountsBN.amount1, token1Decimals),
      } as UserAmounts;
      return userAmounts;
    } else {
      return userAmountsBN;
    }
  } else if (!raw) {
    return {
      amount0: '0',
      amount1: '0',
      0: '0',
      1: '0',
    } as UserAmounts;
  } else {
    return {
      amount0: BigNumber.from(0),
      amount1: BigNumber.from(0),
      0: BigNumber.from(0),
      1: BigNumber.from(0),
    } as UserAmountsBN;
  }
}

export async function getAllUserAmounts(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<UserAmountsInVault[]>;

export async function getAllUserAmounts(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw: true,
): Promise<UserAmountsInVaultBN[]>;

export async function getAllUserAmounts(
  accountAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  raw?: true,
) {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId}`);
  }
  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`This function is unsupported for DEX ${dex} on chain ${chainId}`);

  let shares: UserBalanceInVaultBN[];
  const key = `${chainId + accountAddress}-balances`;
  if (!Object.prototype.hasOwnProperty.call(promises, key)) {
    promises[key] = request<UserBalancesQueryData, { accountAddress: string }>(url, userBalancesQuery, {
      accountAddress: accountAddress.toLowerCase(),
    })
      .then(({ user }) => user)
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */));
  }

  try {
    const balances = await promises[key];
    if (balances) {
      const userBalances = ((await promises[key]) as UserBalances).vaultShares;
      shares = userBalances.map((balance) => {
        return { vaultAddress: balance.vault.id, shares: parseBigInt(balance.vaultShareBalance, ichiVaultDecimals) };
      });

      const totalSupplyBnPromises = shares.map((vault) => {
        const vaultContract = getIchiVaultContract(vault.vaultAddress, jsonProvider);
        return vaultContract.totalSupply();
      });
      const totalSuppliesBN = await Promise.all(totalSupplyBnPromises);

      const totalAmountsBnPromises = shares.map((vault) => {
        return getTotalAmounts(vault.vaultAddress, jsonProvider, dex, true);
      });
      const totalAmountsBN = await Promise.all(totalAmountsBnPromises);

      const token0DecimalsPromises = userBalances.map((vault) => {
        const token0Contract = getERC20Contract(vault.vault.tokenA, jsonProvider);
        return token0Contract.decimals();
      });
      const token0Decimals = await Promise.all(token0DecimalsPromises);

      const token1DecimalsPromises = userBalances.map((vault) => {
        const token1Contract = getERC20Contract(vault.vault.tokenB, jsonProvider);
        return token1Contract.decimals();
      });
      const token1Decimals = await Promise.all(token1DecimalsPromises);

      const amounts = shares.map((vault, index) => {
        const userBalance = vault.shares;
        const vaultTotalAmountsBN = totalAmountsBN[index];
        const vaultTotalSupplyBN = totalSuppliesBN[index];
        if (!vaultTotalSupplyBN.isZero()) {
          const amount0 = userBalance.mul(vaultTotalAmountsBN[0]).div(vaultTotalSupplyBN);
          const amount1 = userBalance.mul(vaultTotalAmountsBN[1]).div(vaultTotalSupplyBN);
          const userAmountsBN = {
            amount0,
            amount1,
            0: amount0,
            1: amount1,
          } as UserAmountsBN;
          if (!raw) {
            const vaultToken0Decimals = token0Decimals[index];
            const vaultToken1Decimals = token1Decimals[index];
            const userAmounts = {
              amount0: formatBigInt(amount0, vaultToken0Decimals),
              amount1: formatBigInt(amount1, vaultToken1Decimals),
              0: formatBigInt(amount0, vaultToken0Decimals),
              1: formatBigInt(amount1, vaultToken1Decimals),
            } as UserAmounts;
            return { vaultAddress: vault.vaultAddress, userAmounts };
          } else {
            return { vaultAddress: vault.vaultAddress, userAmounts: userAmountsBN };
          }
        } else if (!raw) {
          return {
            vaultAddress: vault.vaultAddress,
            userAmounts: {
              amount0: '0',
              amount1: '0',
              0: '0',
              1: '0',
            },
          } as UserAmountsInVault;
        } else {
          return {
            vaultAddress: vault.vaultAddress,
            userAmounts: {
              amount0: BigNumber.from(0),
              amount1: BigNumber.from(0),
              0: BigNumber.from(0),
              1: BigNumber.from(0),
            },
          } as UserAmountsInVaultBN;
        }
      });
      return amounts;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Could not get user amounts');
    throw error;
  }
}