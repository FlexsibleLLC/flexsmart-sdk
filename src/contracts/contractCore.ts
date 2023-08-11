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
      this.getSignerOrProvider()
    ) as T;

    this.readonlyContract = this.writableContract.connect(
      this.getProvider()
    ) as T;
  }

  public override updateProviderOrSigner(
    providerOrSigner: ProviderOrSigner
  ): void {
    super.updateProviderOrSigner(providerOrSigner);
    this.writableContract = this.writableContract.connect(
      this.getSignerOrProvider()
    ) as T;
    // setup the read only contract
    this.readonlyContract = this.writableContract.connect(
      this.getProvider()
    ) as T;
  }

  public async sendTransaction(
    funcName: string,
    args: any[]
  ): Promise<providers.TransactionReceipt> {
      // TODO: validate the address belongs to a smart contract
      const contractFunc: ContractFunction = (
        this.writableContract.functions as any
      )[funcName];

      let transaction: ContractTransaction;
      transaction = await contractFunc(...args);
      // TODO: emit event from tx being in progress transaction
      const receipt = transaction.wait();
      // TODO: emit event from tx being done
      return receipt;
  }

  public async getSignerAddress(): Promise<string> {
    const signer = this.getSigner();
    if (!signer) {
      // TODO: find a more friendly message
      throw new Error('No valid signer connected. Plese');
    }

    return await signer.getAddress();
  }
}
