import { providers, Signer, Wallet } from 'ethers';
import { RPCConnection } from './rpcConnection';
import { ProviderOrSigner } from './types';
import { FlexsmartWallet } from './wallet';
import erc20ABI from './abis/erc20.json';
import { ContractBuilder } from './contracts/contractBuilder';

export class FlexsmartSDK {
  private rpcConnection: RPCConnection;
  private providerOrSigner: ProviderOrSigner;
  public wallet: FlexsmartWallet;

  constructor(providerOrSigner: ProviderOrSigner) {
    this.rpcConnection = new RPCConnection(providerOrSigner);
    this.wallet = new FlexsmartWallet(providerOrSigner);
  }

  static fromSigner(signer: Signer): FlexsmartSDK {
    const fsSDK = new FlexsmartSDK(signer);
    fsSDK.updateSignerOrProvider(signer);
    return fsSDK;
  }

  static fromPrivateKey(
    privateKey: string,
    providerOrNetwork: providers.Provider | string
  ): FlexsmartSDK {
    const provider =
      typeof providerOrNetwork === 'string'
        ? new providers.JsonRpcProvider(providerOrNetwork)
        : (providerOrNetwork as providers.Provider);

    const signer = new Wallet(privateKey, provider);
    return FlexsmartSDK.fromSigner(signer);
  }

  public updateSignerOrProvider(providerOrSigner: ProviderOrSigner) {
    this.providerOrSigner = providerOrSigner;
    this.rpcConnection.updateProviderOrSigner(providerOrSigner);

    // TODO: update more things and reconnect on the wallet.
  }

  public async getContract(address: string) {
    try {
      return new ContractBuilder(address, this.providerOrSigner, erc20ABI.abi);
    } catch (err) {
      // TODO: handle this err properly
    }
  }
}
