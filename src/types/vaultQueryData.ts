// eslint-disable-next-line import/no-cycle
import { IchiVault } from '..';

export interface VaultQueryData {
  ichiVault: IchiVault;
}

export interface VaultsByTokensQueryData {
  ichiVaults: IchiVault[];
}
