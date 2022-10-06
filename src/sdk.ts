import { providers, Signer, Wallet } from 'ethers';
import { RPCConnection } from './rpcConnection';
import { ProviderOrSigner } from './types';
import { FlexsmartWallet } from './wallet';

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
    provider: providers.Provider
  ): FlexsmartSDK {
    const signer = new Wallet(privateKey, provider);
    return FlexsmartSDK.fromSigner(signer);
  }

  public updateSignerOrProvider(providerOrSigner: ProviderOrSigner) {
    this.rpcConnection.updateProviderOrSigner(providerOrSigner);

    // TODO: update more things and reconnect on the wallet.
  }
}
