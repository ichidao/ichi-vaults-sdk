// eslint-disable-next-line import/no-unresolved
import { gql } from 'graphql-request';

export function vaultQuery(includeHoldersCount: boolean, version: number = 1) {
  // Version 2 uses token0/token1 instead of tokenA/tokenB
  if (version === 2) {
    return gql`
      query ($vaultAddress: String!) {
        ichiVault(id: $vaultAddress) {
          id
          token0
          token1
          allowToken0
          allowToken1
          fee
          ${includeHoldersCount ? 'holdersCount' : ''}
        }
      }
    `;
  }

  // Default to version 1
  return gql`
    query ($vaultAddress: String!) {
      ichiVault(id: $vaultAddress) {
        id
        tokenA
        tokenB
        allowTokenA
        allowTokenB
        fee
        ${includeHoldersCount ? 'holdersCount' : ''}
      }
    }
  `;
}

export function vaultQueryAlgebra(includeHoldersCount: boolean, version: number = 1) {
  // Version 2 uses token0/token1 instead of tokenA/tokenB
  if (version === 2) {
    return gql`
      query ($vaultAddress: String!) {
        ichiVault(id: $vaultAddress) {
          id
          token0
          token1
          allowToken0
          allowToken1
          ${includeHoldersCount ? 'holdersCount' : ''}
        }
      }
    `;
  }

  // Default to version 1
  return gql`
    query ($vaultAddress: String!) {
      ichiVault(id: $vaultAddress) {
        id
        tokenA
        tokenB
        allowTokenA
        allowTokenB
        ${includeHoldersCount ? 'holdersCount' : ''}
      }
    }
  `;
}

export function vaultByTokensQuery(version: number = 1) {
  // Version 2 uses token0/token1 instead of tokenA/tokenB
  if (version === 2) {
    return gql`
      query ($addressTokenA: String!, $addressTokenB: String!) {
        ichiVaults(where: { token0: $addressTokenA, token1: $addressTokenB }) {
          id
          token0
          token1
          allowToken0
          allowToken1
        }
      }
    `;
  }

  return gql`
    query ($addressTokenA: String!, $addressTokenB: String!) {
      ichiVaults(where: { tokenA: $addressTokenA, tokenB: $addressTokenB }) {
        id
        tokenA
        tokenB
        allowTokenA
        allowTokenB
      }
    }
  `;
}

export const vaultByPoolQuery = gql`
  query ($poolAddress: String!) {
    deployICHIVaults(where: { pool: $poolAddress }) {
      vault
    }
  }
`;

export const rebalancesQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamp ? `"${lastTimestamp}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const vaultCollectFeesQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultCollectFees(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: $createdAtTimestamp_gt,
        ${lastTimestamp ? `createdAtTimestamp_gt: "${lastTimestamp}"` : ''}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const vaultDepositsQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultDeposits(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamp ? `"${lastTimestamp}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      vault
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      sqrtPrice
      totalSupply
    }
  }
`;

export const vaultWithdrawsQuery = (lastTimestamp: string) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultWithdraws(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamp ? `"${lastTimestamp}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const allEventsQuery = (lastTimestamps: {
  rebalances?: string;
  collectFees?: string;
  deposits?: string;
  withdraws?: string;
}) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${
          lastTimestamps.rebalances ? `"${lastTimestamps.rebalances}"` : '$createdAtTimestamp_gt'
        }
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    },
    vaultCollectFees(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${
          lastTimestamps.collectFees ? `"${lastTimestamps.collectFees}"` : '$createdAtTimestamp_gt'
        }
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    },
    vaultDeposits(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.deposits ? `"${lastTimestamps.deposits}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      vault
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      sqrtPrice
      totalSupply
    },
    vaultWithdraws(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.withdraws ? `"${lastTimestamps.withdraws}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export const allEventsNoCollectFeesQuery = (lastTimestamps: {
  rebalances?: string;
  deposits?: string;
  withdraws?: string;
}) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${
          lastTimestamps.rebalances ? `"${lastTimestamps.rebalances}"` : '$createdAtTimestamp_gt'
        }
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      feeAmount0
      feeAmount1
      totalAmount0
      totalAmount1
      createdAtTimestamp
      vault
      sqrtPrice
      totalSupply
    },
    vaultDeposits(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.deposits ? `"${lastTimestamps.deposits}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      vault
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      sqrtPrice
      totalSupply
    },
    vaultWithdraws(
      first: 1000,
      where: {
        vault: $vaultAddress,
        createdAtTimestamp_gt: ${lastTimestamps.withdraws ? `"${lastTimestamps.withdraws}"` : '$createdAtTimestamp_gt'}
      },
      orderBy: createdAtTimestamp,
      orderDirection: asc
    ) {
      createdAtTimestamp
      totalAmount0
      totalAmount1
      totalAmount0BeforeEvent
      totalAmount1BeforeEvent
      vault
      sqrtPrice
      totalSupply
    }
  }
`;

export function userBalancesQuery(version: number = 1) {
  if (version === 2) {
    return gql`
      query ($accountAddress: String!) {
        user(id: $accountAddress) {
          vaultShares {
            vault {
              id
              token0
              token1
            }
            vaultShareBalance
          }
        }
      }
    `;
  }
  return gql`
    query ($accountAddress: String!) {
      user(id: $accountAddress) {
        vaultShares {
          vault {
            id
            tokenA
            tokenB
          }
          vaultShareBalance
        }
      }
    }
  `;
}

export const feeAprQuery = gql`
  query ($vaultAddress: String!) {
    ichiVault(id: $vaultAddress) {
      feeApr_1d
      feeApr_3d
      feeApr_7d
      feeApr_30d
    }
  }
`;
