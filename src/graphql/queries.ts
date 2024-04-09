// eslint-disable-next-line import/no-unresolved
import { gql } from 'graphql-request';

export const vaultQuery = gql`
  query ($vaultAddress: String!) {
    ichiVault(id: $vaultAddress) {
      id
      tokenA
      tokenB
      allowTokenA
      allowTokenB
    }
  }
`;

export const vaultByTokensQuery = gql`
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

export const rebalancesQuery = (page: number) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(first:1000, skip: ${
      page * 1000
    }, where: { vault: $vaultAddress, createdAtTimestamp_gt: $createdAtTimestamp_gt }) {
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

export const vaultCollectFeesQuery = (page: number) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultCollectFees(first: 1000, skip: ${
      page * 1000
    }, where: { vault: $vaultAddress, createdAtTimestamp_gt: $createdAtTimestamp_gt }) {
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

export const vaultDepositsQuery = (page: number) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultDeposits(first: 1000, skip: ${
      page * 1000
    }, where: { vault: $vaultAddress, createdAtTimestamp_gt: $createdAtTimestamp_gt }) {
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

export const vaultWithdrawsQuery = (page: number) => gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultWithdraws(first: 1000, skip: ${
      page * 1000
    }, where: { vault: $vaultAddress, createdAtTimestamp_gt: $createdAtTimestamp_gt }) {
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

export const userBalancesQuery = gql`
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
