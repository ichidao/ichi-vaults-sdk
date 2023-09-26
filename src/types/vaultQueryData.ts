export interface IchiVault {
  id: string;
  tokenA: string;
  tokenB: string;
  allowTokenA: boolean;
  allowTokenB: boolean;
}

export interface VaultQueryData {
  ichiVault: IchiVault;
}
