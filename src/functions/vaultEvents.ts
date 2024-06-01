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
import { validateVaultData } from './vault';
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
async function sendCollectFeesQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
): Promise<CollectFeesQueryData['vaultCollectFees']> {
  return request<CollectFeesQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(url, query, {
    vaultAddress,
    createdAtTimestamp_gt,
  }).then(({ vaultCollectFees }) => vaultCollectFees);
}
async function sendDepositsQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
): Promise<VaultDepositsQueryData['vaultDeposits']> {
  return request<VaultDepositsQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(url, query, {
    vaultAddress,
    createdAtTimestamp_gt,
  }).then(({ vaultDeposits }) => vaultDeposits);
}
async function sendWithdrawsQueryRequest(
  url: string,
  vaultAddress: string,
  createdAtTimestamp_gt: string,
  query: string,
): Promise<VaultWithdrawsQueryData['vaultWithdraws']> {
  return request<VaultWithdrawsQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(url, query, {
    vaultAddress,
    createdAtTimestamp_gt,
  }).then(({ vaultWithdraws }) => vaultWithdraws);
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
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendRebalancesQueryRequest(url, vaultAddress, startTimestamp, rebalancesQuery(page));
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
  storeResult(key, rebalances);

  return rebalances;
}

export async function getFeesCollectedEvents(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<Fees[]> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const key = `${chainId + vaultAddress + days}-collect-fees`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const supportsCollectFees = graphUrls[chainId as SupportedChainId]![dex]?.supportsCollectFees;
  if (!supportsCollectFees) {
    const result = [] as unknown as Promise<Fees[]>;
    storeResult(key, result);
    return result;
  }

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const otherFees = [] as Fees[];
  let endOfData = false;
  let page = 0;
  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendCollectFeesQueryRequest(
          publishedUrl,
          vaultAddress,
          startTimestamp,
          vaultCollectFeesQuery(page),
        );
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendCollectFeesQueryRequest(url, vaultAddress, startTimestamp, vaultCollectFeesQuery(page));
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get collected fees for vault ${vaultAddress} on chain ${chainId}`);
      }
    }
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
  storeResult(key, otherFees);

  return otherFees;
}

export async function getDeposits(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<VaultTransactionEvent[]> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const key = `${chainId + vaultAddress + days}-deposits`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const depositEvents = [] as VaultTransactionEvent[];
  let endOfData = false;
  let page = 0;
  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendDepositsQueryRequest(publishedUrl, vaultAddress, startTimestamp, vaultDepositsQuery(page));
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendDepositsQueryRequest(url, vaultAddress, startTimestamp, vaultDepositsQuery(page));
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get deposits for vault ${vaultAddress} on chain ${chainId}`);
      }
    }
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
  storeResult(key, depositEvents);

  return depositEvents;
}

export async function getWithdraws(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<VaultTransactionEvent[]> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const key = `${chainId + vaultAddress + days}-withdraws`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const { publishedUrl, url } = getGraphUrls(chainId, dex, true);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  const withdrawEvents = [] as VaultTransactionEvent[];
  let endOfData = false;
  let page = 0;
  while (!endOfData) {
    let result;
    try {
      if (publishedUrl) {
        result = await sendWithdrawsQueryRequest(publishedUrl, vaultAddress, startTimestamp, vaultWithdrawsQuery(page));
      } else {
        throw new Error(`Published URL is invalid for dex ${dex} on chain ${chainId}`);
      }
    } catch (error) {
      if (publishedUrl) {
        console.error('Request to published graph URL failed:', error);
      }
      try {
        result = await sendWithdrawsQueryRequest(url, vaultAddress, startTimestamp, vaultWithdrawsQuery(page));
      } catch (error2) {
        console.error('Request to public graph URL failed:', error2);
        throw new Error(`Could not get withdraws for vault ${vaultAddress} on chain ${chainId}`);
      }
    }
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
  storeResult(key, withdrawEvents);

  return withdrawEvents;
}

export async function getAllVaultEvents(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
): Promise<VaultState[]> {
  const { chainId } = await validateVaultData(vaultAddress, jsonProvider, dex);

  const key = `${chainId + vaultAddress}-all-events`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

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
  storeResult(key, result);

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
