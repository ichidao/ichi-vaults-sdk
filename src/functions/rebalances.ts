/* eslint-disable camelcase */
/* eslint-disable radix */
// eslint-disable-next-line import/no-unresolved
import { request } from 'graphql-request';
import { JsonRpcProvider } from '@ethersproject/providers';
import { SupportedDex, SupportedChainId } from '../types';
// eslint-disable-next-line import/no-cycle
import { RebalancesQueryData } from '../types/vaultQueryData';
import { urls } from '../graphql/constants';
import { rebalancesQuery } from '../graphql/queries';

const promises: Record<string, Promise<any>> = {};

function daysToMilliseconds(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

// eslint-disable-next-line import/prefer-default-export
export async function getRebalances(
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  days?: number,
): Promise<RebalancesQueryData['vaultRebalances']> {
  const { chainId } = await jsonProvider.getNetwork();
  if (!Object.values(SupportedChainId).includes(chainId)) {
    throw new Error(`Unsupported chainId: ${chainId ?? 'undefined'}`);
  }

  const key = `${chainId + vaultAddress}-rebalances`;
  if (Object.prototype.hasOwnProperty.call(promises, key)) return promises[key];

  const url = urls[chainId as SupportedChainId]![dex];
  if (!url) throw new Error(`Unsupported DEX ${dex} on chain ${chainId}`);

  const currTimestamp = Date.now();
  const startTimestamp = days
    ? parseInt(((currTimestamp - daysToMilliseconds(days)) / 1000).toString()).toString()
    : '0';

  if (url === 'none' && jsonProvider) {
    // promises[key] = [];
  } else {
    promises[key] = request<RebalancesQueryData, { vaultAddress: string; createdAtTimestamp_gt: string }>(
      url,
      rebalancesQuery,
      {
        vaultAddress,
        createdAtTimestamp_gt: startTimestamp,
      },
    )
      .then(({ vaultRebalances }) => vaultRebalances)
      .catch((err) => {
        console.error(err);
        if (jsonProvider) {
          // promises[key] = getVaultInfoFromContract(vaultAddress, jsonProvider);
        }
      })
      .finally(() => setTimeout(() => delete promises[key], 2 * 60 * 100 /* 2 mins */));
  }

  // eslint-disable-next-line no-return-await
  return await promises[key];
}
