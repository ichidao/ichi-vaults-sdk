/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
// eslint-disable-next-line import/no-unresolved
import { request } from 'graphql-request';
import { JsonRpcProvider } from '@ethersproject/providers';
import { SupportedDex, SupportedChainId, Fees, VaultTransactionEvent, VaultState } from '../types';
// eslint-disable-next-line import/no-cycle
import {
  CollectFeesQueryData,
  RebalancesQueryData,
  VaultDepositsQueryData,
  VaultWithdrawsQueryData,
} from '../types/vaultQueryData';
import { graphUrls } from '../graphql/constants';
import { rebalancesQuery, vaultCollectFeesQuery, vaultDepositsQuery, vaultWithdrawsQuery } from '../graphql/queries';
import { daysToMilliseconds } from '../utils/timestamps';
import { getIchiVaultInfo, validateVaultData } from './vault';
import getGraphUrls from '../utils/getGraphUrls';

const promises: Record<string, Promise<any>> = {};

async function sendRebalancesQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
): Promise<RebalancesQueryData['vaultRebalances']> {
  return request<RebalancesQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(url, query, {
    vaultAddress,
    createdAtTimestamp_gt,
  }).then(({ vaultRebalances }) => vaultRebalances);
}
function storeResult(key: string, result: any) {
  promises[key] = Promise.resolve(result);
  setTimeout(() => {
    delete promises[key];
  }, 120000); // 120000 ms = 2 minutes
}

export async function getRebalances(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<Fees[]> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const key = `${chainId + vaultAddress + days}-rebalances`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const rebalances = [] as Fees[];
  let endOfData = false;
  let page = 0;
  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendRebalancesQueryRequest(publishedUrl, vaultAddress, startTimestamp, rebalancesQuery(page));
        storeResult(key, result);
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendRebalancesQueryRequest(url, vaultAddress, startTimestamp, rebalancesQuery(page));
        storeResult(key, result);
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get rebalances for vault ${vaultAddress} on chain ${chainId}`);
      }
    }
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
  if (url === 'none') throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);
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
  if (url === 'none') throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);

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
  if (url === 'none') throw new Error(`Function not available for DEX ${dex} on chain ${chainId}`);

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

export async function getAllVaultEvents(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<VaultState[]> {
  const { chainId } = await jsonProvider.getNetwork();

  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const vault = await getIchiVaultInfo(chainId, dex, vaultAddress, jsonProvider);
  if (!vault) throw new Error(`Vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);

  const rebalances = (await getRebalances(vaultAddress, jsonProvider, dex)) as VaultState[];
  if (!rebalances) throw new Error(`Error getting vault rebalances on ${chainId} for ${vaultAddress}`);
  const collectedFees = (await getFeesCollectedEvents(vaultAddress, jsonProvider, dex)) as VaultState[];
  if (!collectedFees) throw new Error(`Error getting vault collected fees on ${chainId} for ${vaultAddress}`);
  const deposits = (await getDeposits(vaultAddress, jsonProvider, dex)) as VaultState[];
  if (!deposits) throw new Error(`Error getting vault deposits on ${chainId} for ${vaultAddress}`);
  const withdraws = (await getWithdraws(vaultAddress, jsonProvider, dex)) as VaultState[];
  if (!withdraws) throw new Error(`Error getting vault withdraws on ${chainId} for ${vaultAddress}`);

  const result = [...deposits, ...withdraws, ...rebalances, ...collectedFees].sort(
    (a, b) => Number(b.createdAtTimestamp) - Number(a.createdAtTimestamp), // recent events first
  );

  return result;
}

export function getVaultStateAt(vaultEvents: VaultState[], daysAgo: number): VaultState | null {
  if (vaultEvents.length === 0) {
    return null;
  }
  const eventsBefore = vaultEvents.filter(
    (e) => Number(e.createdAtTimestamp) * 1000 <= Date.now() - daysToMilliseconds(daysAgo),
  );
  if (eventsBefore.length > 0) {
    return eventsBefore[0];
  } else {
    return null;
  }
}
