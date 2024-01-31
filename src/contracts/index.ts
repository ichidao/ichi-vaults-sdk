/* eslint-disable camelcase */
import { getAddress } from '@ethersproject/address';
import { JsonRpcProvider } from '@ethersproject/providers';
import { SignerOrProvider } from '../types';
import {
  ERC20__factory as ERC20Factory,
  ERC20,
  IchiVault__factory,
  IchiVault,
  DepositGuard__factory,
  DepositGuard,
  UniswapV3Pool__factory,
  AlgebraPool__factory,
  UniswapV3Pool,
  AlgebraPool,
} from '../../abis/types';

function getERC20Contract(address: string, signerOrProvider: SignerOrProvider): ERC20 {
  getAddress(address);
  return ERC20Factory.connect(address, signerOrProvider);
}

function getDepositGuardContract(address: string, signerOrProvider: SignerOrProvider): DepositGuard {
  getAddress(address);
  return DepositGuard__factory.connect(address, signerOrProvider);
}

function getIchiVaultContract(address: string, signerOrProvider: SignerOrProvider): IchiVault {
  getAddress(address);
  return IchiVault__factory.connect(address, signerOrProvider);
}

export function getUniswapV3PoolContract(address: string, provider: JsonRpcProvider): UniswapV3Pool {
  try {
    return UniswapV3Pool__factory.connect(address, provider);
  } catch (e) {
    console.error(`Couldn't create UniswapV3Pool contract with address: ${address}`);
    throw e;
  }
}
export function getAlgebraPoolContract(address: string, provider: JsonRpcProvider): AlgebraPool {
  try {
    return AlgebraPool__factory.connect(address, provider);
  } catch (e) {
    console.error(`Couldn't create AlgebraPool contract with address: ${address}`);
    throw e;
  }
}
export { getERC20Contract, getDepositGuardContract, getIchiVaultContract };
