import { BaseContract, ContractInterface } from 'ethers';
import { ProviderOrSigner } from '../types';
import { ContractCore } from './contractCore';
import { Erc20 } from './erc20';

export class ContractBuilder<T extends BaseContract> {
  private contractCore: ContractCore<T>;
  private abi: ContractInterface;

  constructor(
    address: string,
    providerOrSigner: ProviderOrSigner,
    abi: ContractInterface,
    contractCore = new ContractCore<T>(providerOrSigner, address, abi)
  ) {
    this.contractCore = contractCore;
    this.abi = abi;
  }

  getERC20() {
    return new Erc20(this.contractCore);
  }
}
