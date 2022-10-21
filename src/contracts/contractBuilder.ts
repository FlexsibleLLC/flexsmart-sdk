import { BaseContract, ContractInterface } from 'ethers';
import { ProviderOrSigner } from '../types';
import { ContractCore } from './contractCore';
import { Erc20 } from './erc20';

export class ContractBuilder<T extends BaseContract> {
  private contractCore: ContractCore<T>;
  private abi: ContractInterface;
  private address: string;

  constructor(
    address: string,
    providerOrSigner: ProviderOrSigner,
    abi: ContractInterface,
    contractCore = new ContractCore<T>(providerOrSigner, address, abi)
  ) {
    this.contractCore = contractCore;
    this.abi = abi;
    this.address = address;
  }

  getERC20(contractsCache: Map<string, Erc20<BaseContract>>) {
    if (contractsCache.has(this.address)) {
      return contractsCache.get(this.address);
    }

    const erc20 = new Erc20(this.contractCore);
    contractsCache.set(this.address, erc20);

    return erc20;
  }
}
