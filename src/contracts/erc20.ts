import { BaseContract, utils, BigNumber, BigNumberish } from 'ethers';
import { ProviderOrSigner, features, ABI } from '../types';
import { ContractCore } from './contractCore';
import { getFeatures } from '../utils/abi';

export class Erc20<T extends BaseContract> {
  private contractCore: ContractCore<T>;

  private contractFeatures: features;

  constructor(contractCore: ContractCore<T>) {
    this.contractCore = contractCore;
    this.contractFeatures = getFeatures(contractCore.abi as ABI);
  }

  // TODO: use a base contract class to handle this share functionality
  onNetworkUpdated(providerOrSigner: ProviderOrSigner): void {
    this.contractCore.updateProviderOrSigner(providerOrSigner);
  }

  // TODO: add currency custom type to be returned on the methods that needs it
  public async mint(to: string, amount: string): Promise<any> {
    if (!this.contractFeatures.mintable) {
      throw new Error('contract is not mintable');
    }

    return {
      receipt: await this.contractCore.sendTransaction('mint', [
        to,
        await this.normalizeAmount(amount),
      ]),
    };
  }

  public async transfer(to: string, amount: string): Promise<any> {
    return {
      receipt: await this.contractCore.sendTransaction('transfer', [
        to,
        await this.normalizeAmount(amount),
      ]),
    };
  }

  public async balanceOf(address: string): Promise<any> {
    return await this.contractCore.readonlyContract.balanceOf(address);
  }

  public async totalSupply(): Promise<any> {
    const totalSupply = await this.contractCore.readonlyContract.totalSupply();
    return await this.formatAmount(totalSupply);
  }

  public async normalizeAmount(amount: string): Promise<BigNumber> {
    // TODO: add a new type with validation for the amount
    const decimals = await this.contractCore.readonlyContract.decimals();
    return utils.parseUnits(amount, decimals);
  }

  public async formatAmount(amount: BigNumberish): Promise<string> {
    const decimals = await this.contractCore.readonlyContract.decimals();
    return utils.formatUnits(amount, decimals);
  }

  public async burnFrom(holderAddress: string, amount: string): Promise<any> {
    if (!this.contractFeatures.burnable) {
      throw new Error('contract is not burnable');
    }

    return {
      receipt: await this.contractCore.sendTransaction('burnFrom', [
        holderAddress,
        await this.normalizeAmount(amount),
      ]),
    };
  }

  public async burn(amount: string): Promise<any> {
    if (!this.contractFeatures.mintable) {
      throw new Error('contract is not burnable');
    }

    return {
      receipt: await this.contractCore.sendTransaction('burn', [
        await this.normalizeAmount(amount),
      ]),
    };
  }

  public async setAllowance(spender: string, amount: string): Promise<any> {
    return {
      receipt: await this.contractCore.sendTransaction('approve', [
        spender,
        await this.normalizeAmount(amount),
      ]),
    };
  }

  public async allowanceOf(owner: string, spender: string): Promise<any> {
    const allowanceAmount = await this.contractCore.readonlyContract.allowance(
      owner,
      spender
    );

    return await this.formatAmount(allowanceAmount);
  }

  public async allowance(spender: string): Promise<any> {
    return await this.allowanceOf(
      await this.contractCore.getSignerAddress(),
      spender
    );
  }

  public async rawTransaction(name: string, ...params: any): Promise<any> {
    return {
      receipt: await this.contractCore.sendTransaction(name, params),
    };
  }
}
