// eslint-disable-next-line import/no-cycle
import { IchiVault, Fees, VaultTransactionEvent } from '..';

export interface VaultQueryData {
  ichiVault: IchiVault;
}

export interface VaultsByTokensQueryData {
  ichiVaults: IchiVault[];
}

export interface RebalancesQueryData {
  vaultRebalances: Fees[];
}
export interface CollectFeesQueryData {
  vaultCollectFees: Fees[];
}
export interface VaultDepositsQueryData {
  vaultDeposits: VaultTransactionEvent[];
}
export interface VaultWithdrawsQueryData {
  vaultWithdraws: VaultTransactionEvent[];
}
