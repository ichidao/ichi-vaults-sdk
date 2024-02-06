/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
// eslint-disable-next-line import/no-unresolved
import { request } from 'graphql-request';
import { JsonRpcProvider } from '@ethersproject/providers';
import { SupportedDex, SupportedChainId, Fees, VaultTransactionEvent } from '../types';
// eslint-disable-next-line import/no-cycle
import {
  CollectFeesQueryData,
  RebalancesQueryData,
  VaultDepositsQueryData,
  VaultWithdrawsQueryData,
} from '../types/vaultQueryData';
import { graphUrls } from '../graphql/constants';
import { rebalancesQuery, vaultCollectFeesQuery, vaultDepositsQuery, vaultWithdrawsQuery } from '../graphql/queries';
import daysToMilliseconds from '../utils/timestamps';

const promises: Record<string, Promise<any>> = {};

export async function getRebalances(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<Fees[]> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const key = `${chainId + vaultAddress + days}-rebalances`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  if (url === 'none' && jsonProvider) {
    throw new Error(`Unsupported function for DEX ${dex} on chain ${chainId}`);
  } else {
    const rebalances = [] as Fees[];
    let endOfData = false;
    let page = 0;
    while (!endOfData) {
      const result = await request<RebalancesQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
        url,
        rebalancesQuery(page),
        {
          vaultAddress,
          createdAtTimestamp_gt: startTimestamp,
        },
      )
        .then(({ vaultRebalances }) => vaultRebalances)
        .catch((err) => {
          console.error(err);
        });
      if (result) {
        rebalances.push(...result);
        page += 1;
        if (result.length < 1000) {
          endOfData = true;
        }
      } else {
        endOfData = true;
      }
    }

    promises[key] = new Promise((resolve) => resolve(rebalances)).finally(() =>
      setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */),
    );

    return rebalances;
  }
}

export async function getFeesCollectedEvents(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<Fees[]> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const key = `${chainId + vaultAddress + days}-collect-fees`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);
  const supportsCollectFees = graphUrls[chainId as SupportedChainId]![dex]?.supportsCollectFees;
  if (!supportsCollectFees) {
    return [] as unknown as Promise<Fees[]>;
  }

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  if (url === 'none' && jsonProvider) {
    throw new Error(`Unsupported function for DEX ${dex} on chain ${chainId}`);
  } else {
    const otherFees = [] as Fees[];
    let endOfData = false;
    let page = 0;
    while (!endOfData) {
      const result = await request<CollectFeesQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
        url,
        vaultCollectFeesQuery(page),
        {
          vaultAddress,
          createdAtTimestamp_gt: startTimestamp,
        },
      )
        .then(({ vaultCollectFees }) => vaultCollectFees)
        .catch((err) => {
          console.error(err);
        });
      if (result) {
        otherFees.push(...result);
        page += 1;
        if (result.length < 1000) {
          endOfData = true;
        }
      } else {
        endOfData = true;
      }
    }
    promises[key] = new Promise((resolve) => resolve(otherFees)).finally(() =>
      setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */),
    );

    return otherFees;
  }
}

export async function getDeposits(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<VaultTransactionEvent[]> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const key = `${chainId + vaultAddress + days}-deposits`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  if (url === 'none' && jsonProvider) {
    throw new Error(`Unsupported function for DEX ${dex} on chain ${chainId}`);
  } else {
    const depositEvents = [] as VaultTransactionEvent[];
    let endOfData = false;
    let page = 0;
    while (!endOfData) {
      const result = await request<VaultDepositsQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
        url,
        vaultDepositsQuery(page),
        {
          vaultAddress,
          createdAtTimestamp_gt: startTimestamp,
        },
      )
        .then(({ vaultDeposits }) => vaultDeposits)
        .catch((err) => {
          console.error(err);
        });
      if (result) {
        depositEvents.push(...result);
        page += 1;
        if (result.length < 1000) {
          endOfData = true;
        }
      } else {
        endOfData = true;
      }
    }

    promises[key] = new Promise((resolve) => resolve(depositEvents)).finally(() =>
      setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */),
    );

    return depositEvents;
  }
}

export async function getWithdraws(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<VaultTransactionEvent[]> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const key = `${chainId + vaultAddress + days}-withdraws`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const url = graphUrls[chainId as SupportedChainId]![dex]?.url;
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  if (url === 'none' && jsonProvider) {
    throw new Error(`Unsupported function for DEX ${dex} on chain ${chainId}`);
  } else {
    const withdrawEvents = [] as VaultTransactionEvent[];
    let endOfData = false;
    let page = 0;
    while (!endOfData) {
      const result = await request<VaultWithdrawsQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
        url,
        vaultWithdrawsQuery(page),
        {
          vaultAddress,
          createdAtTimestamp_gt: startTimestamp,
        },
      )
        .then(({ vaultWithdraws }) => vaultWithdraws)
        .catch((err) => {
          console.error(err);
        });
      if (result) {
        withdrawEvents.push(...result);
        page += 1;
        if (result.length < 1000) {
          endOfData = true;
        }
      } else {
        endOfData = true;
      }
    }

    promises[key] = new Promise((resolve) => resolve(withdrawEvents)).finally(() =>
      setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */),
    );

    return withdrawEvents;
  }
}
