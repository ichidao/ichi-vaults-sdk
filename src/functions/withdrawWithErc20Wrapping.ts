/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import { ContractTransaction, Overrides } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { getDepositGuardWithHtsWrappingContract } from '../contracts';
import parseBigInt from '../utils/parseBigInt';
import { SupportedChainId, SupportedDex } from '../types';
import { getGasLimit, calculateGasMargin } from '../types/calculateGasMargin';
// eslint-disable-next-line import/no-cycle
import { validateVaultData } from './vault';
import { addressConfig } from '../utils/config/addresses';
import amountWithSlippage from '../utils/amountWithSlippage';
import { getUserBalance } from './userBalances';
import getVaultDeployer from './vaultBasics';
import { _isVaultTokenApproved } from './_withdrawHelpers';

export async function withdrawWithErc20Wrapping(
  accountAddress: string,
  shares: string | number | BigNumber,
  vaultAddress: string,
  jsonProvider: JsonRpcProvider,
  dex: SupportedDex,
  percentSlippage = 1,
  overrides?: Overrides,
): Promise<ContractTransaction> {
  const { chainId, vault } = await validateVaultData(vaultAddress, jsonProvider, dex);

  // This function is only applicable for BONZO vaults on Hedera
  if (dex !== SupportedDex.Bonzo || chainId !== SupportedChainId.hedera) {
    throw new Error(
      `withdrawWithErc20Wrapping is only supported for Bonzo vaults on Hedera. Got dex: ${dex}, chainId: ${chainId}`,
    );
  }

  const signer = jsonProvider.getSigner(accountAddress);

  const vaultDeployerAddress = getVaultDeployer(vaultAddress, chainId, dex);

  const userShares = getUserBalance(accountAddress, vaultAddress, jsonProvider, dex, true);
  const withdrawShares = shares instanceof BigNumber ? shares : parseBigInt(shares, 18);
  if ((await userShares).lt(withdrawShares)) {
    throw new Error(
      `Withdraw amount exceeds user shares amount in vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  const isApproved = await _isVaultTokenApproved(accountAddress, withdrawShares, vault, chainId, jsonProvider, dex);
  if (!isApproved) {
    throw new Error(
      `Vault token transfer is not approved for vault ${vaultAddress} on chain ${chainId} and dex ${dex}`,
    );
  }

  // Obtain Deposit Guard with HTS Wrapping contract
  const depositGuardAddress = addressConfig[chainId as SupportedChainId]![dex]?.depositGuard.address;
  if (!depositGuardAddress) {
    throw new Error(`Deposit Guard for vault ${vaultAddress} not found on chain ${chainId} and dex ${dex}`);
  }
  const depositGuardContract = getDepositGuardWithHtsWrappingContract(depositGuardAddress, signer);
  const maxGasLimit = getGasLimit(chainId);

  // the first call: get estimated amounts
  let amounts = await depositGuardContract.callStatic.withdrawFromICHIVaultAndTryUnwrapToERC20(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    BigNumber.from(0),
    BigNumber.from(0),
    {
      gasLimit: maxGasLimit,
    },
  );

  // reduce the estimated amounts by an acceptable slippage %, default - 1%
  if (percentSlippage < 0.01) throw new Error('Slippage parameter is less than 0.01%.');
  if (percentSlippage > 100) throw new Error('Slippage parameter is more than 100%.');
  amounts = {
    0: amountWithSlippage(amounts[0], percentSlippage),
    1: amountWithSlippage(amounts[1], percentSlippage),
    amount0: amountWithSlippage(amounts[0], percentSlippage),
    amount1: amountWithSlippage(amounts[1], percentSlippage),
  } as [BigNumber, BigNumber] & { amount0: BigNumber; amount1: BigNumber };

  const gasLimit =
    overrides?.gasLimit ??
    calculateGasMargin(
      await depositGuardContract.estimateGas.withdrawFromICHIVaultAndTryUnwrapToERC20(
        vaultAddress,
        vaultDeployerAddress,
        withdrawShares,
        accountAddress,
        amounts[0],
        amounts[1],
      ),
    );

  // the second call: actual withdraw transaction
  const tx = await depositGuardContract.withdrawFromICHIVaultAndTryUnwrapToERC20(
    vaultAddress,
    vaultDeployerAddress,
    withdrawShares,
    accountAddress,
    amounts[0],
    amounts[1],
    {
      ...overrides,
      gasLimit,
    },
  );

  return tx;
}
