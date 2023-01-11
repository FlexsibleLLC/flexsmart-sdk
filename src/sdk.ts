import { providers, Signer, Wallet, BaseContract, ContractFactory } from 'ethers';
import { RPCConnection } from './rpcConnection';
import { ProviderOrSigner } from './types';
import { FlexsmartWallet } from './wallet';
import erc20ABI from './abis/erc20.json';
import erc20ABIMin from './abis/erc20min.json';
import { Erc20 } from './contracts/erc20';
import axios from 'axios';
import { CONTRACTS } from './constants/endpoints';
import { toErc20Supply } from './utils/conversions';
import { getABIFromName } from './utils/abi';
import { ContractCore } from './contracts/contractCore';

export class FlexsmartSDK {
  private rpcConnection: RPCConnection;
  private providerOrSigner: ProviderOrSigner;
  public wallet: FlexsmartWallet;
  private contractsCache = new Map<string, Erc20<BaseContract>>();
  private apiKey: string;
  private env = 'local';

  constructor(providerOrSigner: ProviderOrSigner) {
    this.rpcConnection = new RPCConnection(providerOrSigner);
    this.wallet = new FlexsmartWallet(providerOrSigner);
    this.providerOrSigner = providerOrSigner;
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

  public async getContract(address: string, contractCls: any) {
    try {
      const abi = await (getABIFromName(contractCls.contractName) as Promise<any>);
      if (!abi) throw new Error(`${contractCls.contractName} does not exists`);
      return new contractCls(new ContractCore(this.providerOrSigner, address, abi.abi));
    } catch (err) {
      throw new Error(`contract can not be instanciated: ${err}`);
    }
  }

  public setAPIKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  public setEnv(env: string) {
    this.env = env;
  }

  static envURLs =  {
    local: 'http://localhost:3000',
    dev: '',
    prod: '',
  };

  private getURL(): string {
    if (!Object.keys(FlexsmartSDK.envURLs).includes(this.env)) throw new Error('invalid environment.')
    return FlexsmartSDK.envURLs[this.env];
  }

  // TODO: find a better place for this function
  public async deployERC20(name: string, symbol: string, initialSupply = 0.0, isFullFeature = false, decimals = 18) {
    if (!this.apiKey) throw new Error('API key is required');
    try {
      const abi = isFullFeature ? erc20ABI : erc20ABIMin;
      const erc20Factory = new ContractFactory(abi.abi, abi.bytecode, this.rpcConnection.getSigner());
      const contract =  await erc20Factory.deploy(name, symbol, initialSupply);
      const chainId = await this.rpcConnection.getSigner().getChainId();
      const supply = toErc20Supply(initialSupply, decimals);

      // TODO: find out the right order to handle this transactionally, if one of them fail make them all fail
      // TODO: make this url point to our dev
      return await axios.post(`${this.getURL()}${CONTRACTS}`, {
        name,
        symbol,
        type: 'erc20', // create enum with the allowed values
        chain: 'ethereum',
        network:  chainId ? `0x${chainId}` : '', // create enum with the allowed values
        initialSupply: supply,
        transaction: contract.deployTransaction.hash,
        status: 'submitted', // create enum with the allowed values
        isFullFeature,
      }, {
        withCredentials: true,
        headers: {
          'x-api-key': this.apiKey,
        }
      });
    } catch(err) {
      throw new Error(err);
    }
  }
}
