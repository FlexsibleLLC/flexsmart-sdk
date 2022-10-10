import { BaseContract, utils, BigNumber, BigNumberish } from 'ethers';
import { ContractCore } from './contractCore';

export class Erc20<T extends BaseContract> {
  private contractCore: ContractCore<T>;

  constructor(contractCore: ContractCore<T>) {
    this.contractCore = contractCore;
  }

  // TODO: validate the contract capabilities before sending a transaction
  // TODO: add currency custom type to be returned on the methods that needs it
  // TODO: fetch decimals and other metadata for return a more a accurate value
  public async mint(to: string, amount: string): Promise<any> {
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
}
