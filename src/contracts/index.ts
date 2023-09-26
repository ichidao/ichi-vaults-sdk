/* eslint-disable camelcase */
import { getAddress } from '@ethersproject/address';
import { SignerOrProvider } from '../types';
import {
  ERC20__factory as ERC20Factory,
  ERC20,
  IchiVault__factory,
  IchiVault,
  DepositGuard__factory,
  DepositGuard,
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

export { getERC20Contract, getDepositGuardContract, getIchiVaultContract };
