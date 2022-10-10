import {
  BaseContract,
  Contract,
  providers,
  ContractTransaction,
  ContractFunction,
  ContractInterface,
} from 'ethers';
import { RPCConnection } from '../rpcConnection';
import { ProviderOrSigner } from '../types';

export class ContractCore<T extends BaseContract> extends RPCConnection {
  public writableContract: Contract;
  public readonlyContract: Contract;
  public abi: ContractInterface;

  constructor(
    providerOrSigner: ProviderOrSigner,
    address: string,
    abi: ContractInterface
  ) {
    super(providerOrSigner);
    this.abi = abi;

    this.writableContract = new Contract(
      address,
      abi,
      this.getSigner() || this.getProvider()
    ) as T;

    this.readonlyContract = this.writableContract.connect(
      this.getProvider()
    ) as T;
  }

  public async sendTransaction(
    funcName: string,
    args: any[]
  ): Promise<providers.TransactionReceipt> {
    {
      // TODO: validate the address belongs to a smart contract
      const contractFunc: ContractFunction = (
        this.writableContract.functions as any
      )[funcName];

      console.log('hiiiiii', contractFunc, this.writableContract.functions);
      let transaction: ContractTransaction;
      try {
        transaction = await contractFunc(...args);
      } catch (e) {
        console.log('here errrrrr', e);
        // TODO: handle error
      }

      // TODO: emit event from tx being in progress transaction
      const receipt = transaction.wait();
      // TODO: emit event from tx being done

      return receipt;
    }
  }
}
