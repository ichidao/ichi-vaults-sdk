export interface VaultQueryData {
  ichiVault: IchiVault;
}

export interface IchiVault {
  id: string;
  tokenA: string;
  tokenB: string;
  allowTokenA: boolean;
  allowTokenB: boolean;
}
