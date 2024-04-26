/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */

import 'dotenv/config';

import HDWalletProvider from '@truffle/hdwallet-provider';
import { Web3Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { SupportedDex, SupportedChainId } from '../types';
import ICHIVAULT_ABI from '../abis/IchiVault.json';
import {
  withdraw,
  deposit,
  getMaxDepositAmount,
  isTokenAllowed,
  getTotalAmounts,
  getIchiVaultInfo,
  isDepositTokenApproved,
  approveDepositToken,
  getTotalSupply,
  getUserAmounts,
  getUserBalance,
  getTokenDecimals,
  getVaultsByTokens,
  getFeesCollected,
  getFeesCollectedInfo,
  getAverageDepositTokenRatios,
  depositNativeToken,
  getLpApr,
  getLpPriceChange,
  getAllUserBalances,
  getAllUserAmounts,
  getVaultMetrics,
} from '../index';
import formatBigInt from '../utils/formatBigInt';
import parseBigInt from '../utils/parseBigInt';

const hdWalletProvider = new HDWalletProvider([process.env.PRIVATE_KEY!], process.env.PROVIDER_URL!, 0, 1);

const provider = new Web3Provider(hdWalletProvider, {
  chainId: SupportedChainId.bsc,
  name: 'Binance Smart Chain',
});
const account = process.env.ACCOUNT!;

const vault = {
  address: '0x015eb9b9ce3ab0ddacdab35880171b0078edc02e', //  vault (inverted)
  chainId: SupportedChainId.bsc,
  dex: SupportedDex.Thena,
};

const tokens = {
  pairedToken: '0x0EF4A107b48163ab4b57FCa36e1352151a587Be4',
  depositToken: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
};

const iface = new ethers.utils.Interface(ICHIVAULT_ABI);
const amount1 = '0.5';
const amount0 = '0';
const sharesToWithdraw = '0.004';
const bigAmount = '1000';

describe('Vault', () => {
  let share: string | null = null;

  it('getVaultMetrics', async () => {
    const metrics = await getVaultMetrics(vault.address, provider, vault.dex);
    console.log({ metrics });
    expect(Number(metrics[0]?.avgDtr)).toBeGreaterThan(0);
  });

  it('getTotalSupply', async () => {
    const totalSupply = await getTotalSupply(vault.address, provider, vault.dex);

    expect(Number(totalSupply)).toBeGreaterThan(0);
  });

  it.skip('approve', async () => {
    let approve: ethers.ContractTransaction | null = null;
    approve = await approveDepositToken(account, 1, vault.address, provider, vault.dex, amount1);
    await approve.wait();
    const isApproved = await isDepositTokenApproved(account, 1, amount1, vault.address, provider, vault.dex);
    expect(isApproved).toEqual(true);
  });

  it('isDepositTokenApproved', async () => {
    const isApproved = await isDepositTokenApproved(account, 1, bigAmount, vault.address, provider, vault.dex);
    expect(isApproved).toEqual(false);
  });

  it.skip('deposit', async () => {
    const isAllowed0 = await isTokenAllowed(0, vault.address, provider, vault.dex);
    const isAllowed1 = await isTokenAllowed(1, vault.address, provider, vault.dex);

    const maxDeposit0 = await getMaxDepositAmount(0, vault.address, provider, vault.dex);
    const maxDeposit1 = await getMaxDepositAmount(1, vault.address, provider, vault.dex);

    const vaultFromQuery = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    if (!vaultFromQuery)
      throw new Error(`Vault ${vault.address} not found on chain ${vault.chainId} and dex ${vault.dex}]`);
    const token0Decimals = await getTokenDecimals(vaultFromQuery.tokenA, provider);
    const token1Decimals = await getTokenDecimals(vaultFromQuery.tokenB, provider);

    if (!isAllowed0 && Number(amount0) > 0) return;
    if (!isAllowed1 && Number(amount1) > 0) return;
    if (parseBigInt(amount0, token0Decimals).gt(maxDeposit0) || parseBigInt(amount1, token1Decimals).gt(maxDeposit1))
      return;

    const r = await deposit(account, amount0, amount1, vault.address, provider, vault.dex);
    const a = await r.wait();

    const result: any = a.logs
      .map((e: any) => {
        try {
          console.log('iface.parseLog(e):', iface.parseLog(e));
          return iface.parseLog(e);
        } catch (error) {
          return null;
        }
      })
      .find((e: any) => e && e.name === 'Deposit')?.args;

    console.log('Deposit:', result);

    share = formatBigInt(result.shares);
    console.log('Deposit share:', share);
  });

  it.skip('depositNativeToken', async () => {
    const isAllowed0 = await isTokenAllowed(0, vault.address, provider, vault.dex);
    const isAllowed1 = await isTokenAllowed(1, vault.address, provider, vault.dex);

    const maxDeposit0 = await getMaxDepositAmount(0, vault.address, provider, vault.dex);
    const maxDeposit1 = await getMaxDepositAmount(1, vault.address, provider, vault.dex);

    const vaultFromQuery = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    if (!vaultFromQuery)
      throw new Error(`Vault ${vault.address} not found on chain ${vault.chainId} and dex ${vault.dex}]`);
    const token0Decimals = await getTokenDecimals(vaultFromQuery.tokenA, provider);
    const token1Decimals = await getTokenDecimals(vaultFromQuery.tokenB, provider);

    if (!isAllowed0 && Number(amount0) > 0) return;
    if (!isAllowed1 && Number(amount1) > 0) return;
    if (parseBigInt(amount0, token0Decimals).gt(maxDeposit0) || parseBigInt(amount1, token1Decimals).gt(maxDeposit1))
      return;

    const r = await depositNativeToken(account, amount0, amount1, vault.address, provider, vault.dex);
    const a = await r.wait();

    const result: any = a.logs
      .map((e: any) => {
        try {
          console.log('iface.parseLog(e):', iface.parseLog(e));
          return iface.parseLog(e);
        } catch (error) {
          return null;
        }
      })
      .find((e: any) => e && e.name === 'Deposit')?.args;

    console.log('Deposit:', result);

    share = formatBigInt(result.shares);
    console.log('Deposit share:', share);
  });

  it('getUserBalance', async () => {
    const userShares = await getUserBalance(account, vault.address, provider, vault.dex);

    expect(Number(userShares)).toBeGreaterThanOrEqual(0);
  });

  it('getAllUserBalances', async () => {
    const userShares = await getAllUserBalances(account, provider, vault.dex);

    expect(Number(userShares[0].shares)).toBeGreaterThanOrEqual(0);
  });

  it('getAllUserAmounts', async () => {
    const userAmounts = await getAllUserAmounts(account, provider, vault.dex);

    expect(Number(userAmounts[0].userAmounts.amount0)).toBeGreaterThanOrEqual(0);
  });

  it('getTotalAmounts', async () => {
    const totalAmounts = await getTotalAmounts(vault.address, provider, vault.dex);

    expect(Number(totalAmounts.total0)).toBeGreaterThan(0);
  });

  it('getUserAmounts', async () => {
    const amounts = await getUserAmounts(account, vault.address, provider, vault.dex);

    expect(Number(amounts.amount0)).toBeGreaterThanOrEqual(0);
  });

  it('getFeesCollected_All', async () => {
    const amounts = await getFeesCollected(vault.address, provider, vault.dex);

    expect(Number(amounts[0])).toBeGreaterThanOrEqual(0);
  });

  it('getFeesCollectedInfo', async () => {
    const feeCollected = await getFeesCollectedInfo(vault.address, provider, vault.dex, [1, 7, 30, 1000]);

    expect(Number(feeCollected[0].pctAPR)).toBeGreaterThanOrEqual(0);
  });

  it('getAverageDepositTokenRatios', async () => {
    const avgDtr = await getAverageDepositTokenRatios(vault.address, provider, vault.dex);

    expect(Number(avgDtr[0].percent)).toBeGreaterThanOrEqual(0);
  });

  it('getLpApr', async () => {
    const lpAprs = await getLpApr(vault.address, provider, vault.dex);

    expect(Number(lpAprs[0]?.timeInterval)).toEqual(1);
  });
  it('getLpPriceChange', async () => {
    const lpPriceChange = await getLpPriceChange(vault.address, provider, vault.dex);

    expect(Number(lpPriceChange[0]?.timeInterval)).toEqual(1);
  });

  it.skip('withdraw:deposited', async () => {
    share = sharesToWithdraw;

    await withdraw(account, share, vault.address, provider, vault.dex)
      .then((e) => e.wait())
      .then((a) => {
        const result: any = a.logs
          .map((e: any) => {
            try {
              return iface.parseLog(e);
            } catch (error) {
              return null;
            }
          })
          .find((e: any) => e && e.name === 'Withdraw')?.args;

        console.log('Withdraw:', result);
        expect(formatBigInt(result.shares)).toEqual(share);
      });
  });
});

describe('GraphQL', () => {
  it('GetIchiVaultInfo', async () => {
    const a = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    expect(a).toBeTruthy();
  });
  it('Get vaults by tokens', async () => {
    const a = await getVaultsByTokens(vault.chainId, vault.dex, tokens.depositToken, tokens.pairedToken);
    console.log(a[0]);
    expect(a).toBeTruthy();
  });
});
