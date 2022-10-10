import { BaseContract, utils, BigNumber } from 'ethers';
import { ContractCore } from './contractCore';

export class Erc20<T extends BaseContract> {
  private contractCore: ContractCore<T>;

  constructor(contractCore: ContractCore<T>) {
    this.contractCore = contractCore;
  }

  // TODO: validate the contract capabilities before sending a transaction
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

  public async normalizeAmount(amount: string): Promise<BigNumber> {
    // TODO: add a new type with validation for the amount
    const decimals = await this.contractCore.readonlyContract.decimals();
    return utils.parseUnits(amount, decimals);
  }
}
