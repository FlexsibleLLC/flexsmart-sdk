import { providers, Signer, Wallet, BaseContract } from 'ethers';
import { RPCConnection } from './rpcConnection';
import { ProviderOrSigner } from './types';
import { FlexsmartWallet } from './wallet';
import erc20ABI from './abis/erc20.json';
import { ContractBuilder } from './contracts/contractBuilder';
import { Erc20 } from './contracts/erc20';

export class FlexsmartSDK {
  private rpcConnection: RPCConnection;
  private providerOrSigner: ProviderOrSigner;
  public wallet: FlexsmartWallet;
  private contractsCache = new Map<string, Erc20<BaseContract>>();

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
    this.wallet.connect(this.providerOrSigner);

    for (const [, contract] of this.contractsCache) {
      contract.onNetworkUpdated(providerOrSigner);
    }
  }

  public async getContract(address: string) {
    try {
      return new ContractBuilder(address, this.providerOrSigner, erc20ABI.abi);
    } catch (err) {
      // TODO: handle this err properly
    }
  }
}
