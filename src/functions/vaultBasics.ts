import { SupportedDex, SupportedChainId } from '../types';
import addressConfig from '../utils/config/addresses';

export default function getVaultDeployer(vaultAddress: string, chainId: SupportedChainId, dex: SupportedDex): string {
  let vaultDeployerAddress = addressConfig[chainId as SupportedChainId]![dex]?.vaultDeployerAddress;

  const polVaults = [
    '0x4aef5144131db95c110af41c8ec09f46295a7c4b'.toLowerCase(),
    '0x711901e4b9136119Fb047ABe8c43D49339f161c3'.toLowerCase(),
    '0xE5bf5D33C617556B91558aAfb7BeadB68E9Cea81'.toLowerCase(),
  ];
  const polDeployer = '0xC30220fc19e2db669eaa3fa042C07b28F0c10737';

  if (chainId === SupportedChainId.polygon && polVaults.includes(vaultAddress.toLowerCase())) {
    vaultDeployerAddress = polDeployer;
  }

  if (!vaultDeployerAddress) {
    throw new Error(`Vault deployer not found for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`);
  }
  return vaultDeployerAddress;
}
