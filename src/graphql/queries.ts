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

export const rebalancesQuery = gql`
  query ($vaultAddress: String!, $createdAtTimestamp_gt: String!) {
    vaultRebalances(where: { vault: $vaultAddress, createdAtTimestamp_gt: $createdAtTimestamp_gt }) {
        feeAmount0
        feeAmount1
        createdAtTimestamp
        vault
    }
  }
`;
