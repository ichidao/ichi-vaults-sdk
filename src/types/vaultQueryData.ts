// eslint-disable-next-line import/no-cycle
import { IchiVault, Rebalance } from '..';

export interface VaultQueryData {
  ichiVault: IchiVault;
}

export interface VaultsByTokensQueryData {
  ichiVaults: IchiVault[];
}

export interface RebalancesQueryData {
  vaultRebalances: Rebalance[];
}
