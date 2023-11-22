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
} from '../index';
import formatBigInt from '../utils/formatBigInt';
import parseBigInt from '../utils/parseBigInt';

const hdWalletProvider = new HDWalletProvider([process.env.PRIVATE_KEY!], process.env.PROVIDER_URL!, 0, 1);

// const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);

const provider = new Web3Provider(hdWalletProvider, { chainId: SupportedChainId.polygon, name: 'polygon' });
// const provider = new Web3Provider(hdWalletProvider, { chainId: SupportedChainId.arbitrum, name: 'arbitrum' });
// const provider = new Web3Provider(hdWalletProvider, { chainId: SupportedChainId.bsc, name: 'bsc' });
const account = process.env.ACCOUNT!;

// const vault = {
//   address: '0x3ac9b3db3350a515c702ba19a001d099d4a5f132', // USDC-wETH vault (not inverted)
//   chainId: SupportedChainId.polygon,
//   dex: SupportedDex.UniswapV3,
// };

// const vault = {
//   address: '0x0146204ddca2646a915bd0df74b47498acb4ab3d', // WETH-RAM  vault
//   chainId: SupportedChainId.arbitrum,
//   dex: SupportedDex.Ramses,
// };

// const vault = {
//   address: '0x4fff5696f74c85fd617385842c58d3fb4b29654d', // ETH-THE  vault
//   chainId: SupportedChainId.bsc,
//   dex: SupportedDex.Thena,
// };

const vault = {
  address: '0x74b706767f18a360c0083854ab42c1b96e076229', // WMATIC-QUICK  vault
  chainId: SupportedChainId.polygon,
  dex: SupportedDex.Quickswap,
};

const tokens = {
  pairedToken: '0xB5C064F955D8e7F38fE0460C556a72987494eE17',
  depositToken: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
};

const iface = new ethers.utils.Interface(ICHIVAULT_ABI);
const amount0 = '0.1';
const amount1 = '0';
const sharesToWithdraw = '0.000007';
const bigAmount = '1000';

describe('Vault', () => {
  let share: string | null = null;

  it('getTotalSupply', async () => {
    const totalSupply = await getTotalSupply(vault.address, provider, vault.dex);

    expect(Number(totalSupply)).toBeGreaterThan(0);
  });

  it.skip('approve', async () => {
    let approve0: ethers.ContractTransaction | null = null;
    approve0 = await approveDepositToken(account, 0, vault.address, provider, vault.dex, amount0);
    await approve0.wait();
    const isApproved0 = await isDepositTokenApproved(account, 0, amount0, vault.address, provider, vault.dex);
    expect(isApproved0).toEqual(true);
  });

  it('isDepositTokenApproved', async () => {
    const isApproved0 = await isDepositTokenApproved(account, 0, bigAmount, vault.address, provider, vault.dex);
    expect(isApproved0).toEqual(false);
  });

  it.skip('deposit', async () => {
    const isAllowed0 = await isTokenAllowed(0, vault.address, provider, vault.dex);
    const isAllowed1 = await isTokenAllowed(1, vault.address, provider, vault.dex);

    const maxDeposit0 = await getMaxDepositAmount(0, vault.address, provider, vault.dex);
    const maxDeposit1 = await getMaxDepositAmount(1, vault.address, provider, vault.dex);

    const vaultFromQuery = await getIchiVaultInfo(vault.chainId, vault.dex, vault.address, provider);
    if (!vaultFromQuery) throw new Error(`Vault not found [${vault.chainId}, ${vault.address}]`);
    const token0Decimals = await getTokenDecimals(vaultFromQuery.tokenA, provider);
    const token1Decimals = await getTokenDecimals(vaultFromQuery.tokenB, provider);

    if (!isAllowed0 && Number(amount0) > 0) return;
    if (!isAllowed1 && Number(amount1) > 0) return;
    if (parseBigInt(amount0, token0Decimals) > maxDeposit0 || parseBigInt(amount1, token1Decimals) > maxDeposit1)
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
    console.log('Deposit share:', result.shares);
  });

  it('getUserBalance', async () => {
    const userShares = await getUserBalance(account, vault.address, provider, vault.dex);

    expect(Number(userShares)).toBeGreaterThan(0);
  });

  it('getTotalAmounts', async () => {
    const amounts = await getTotalAmounts(vault.address, provider, vault.dex);

    expect(Number(amounts.total0)).toBeGreaterThan(0);
    // expect(Number(amounts.total1)).toBeGreaterThan(0);
  });

  it('getUserAmounts', async () => {
    const amounts = await getUserAmounts(account, vault.address, provider, vault.dex);

    expect(Number(amounts.amount0)).toBeGreaterThan(0);
    // expect(Number(amounts.amount1)).toBeGreaterThan(0);
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
    expect(a).toBeTruthy();
  });
});
