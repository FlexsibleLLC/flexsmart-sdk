import { providers, Signer, Wallet, BaseContract, ContractFactory, utils } from 'ethers';
import assert from 'assert';
import { RPCConnection } from './rpcConnection';
import { ContractChain, ContractType, CreateContract, CreateEscrow, CreateEscrowBody, DeployedContract, EscrowToken, ProviderOrSigner } from './types';
import { FlexsmartWallet } from './wallet';
import erc20ABI from './abis/erc20.json';
import erc20ABIMin from './abis/erc20min.json';
import bep20ABI from './abis/bep20.json';
import bep20ABIMin from './abis/bep20min.json';
import erc777ABIMin from './abis/erc777min.json';
import escrowABI from './abis/escrow.json';
import { Erc20 } from './contracts/erc20';
import axios from 'axios';
import { CONTRACTS, ESCROWS, APIKEY_VALIDATE } from './constants/endpoints';
import { toErc20Supply } from './utils/conversions';
import { getABIFromName } from './utils/abi';
import { ContractCore } from './contracts/contractCore';
import { Errors } from './constants/errors';
import { getErc20ContractAddress } from './constants/tokenAddress';
import { ERC20_ADDRESS_PLACEHOLDER, libraryAddressesByChainId } from './constants/escrowLib';

export class FlexsmartSDK {
  private rpcConnection: RPCConnection;
  private providerOrSigner: ProviderOrSigner;
  public wallet: FlexsmartWallet;
  private contractsCache = new Map<string, Erc20<BaseContract>>();
  private apiKey: string;
  private validApiKey = false;
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
    this.validApiKey = false;
  }

  public setEnv(env: string) {
    this.env = env;
  }

  static envURLs =  {
    local: 'http://localhost:3000',
    dev: 'https://dev-hub.flexsmart.io',
    prod: 'https://hub.flexsmart.io',
    edu: 'https://edu.flexsmart.io',
  };

  private getURL(): string {
    if (!Object.keys(FlexsmartSDK.envURLs).includes(this.env)) throw new Error('invalid environment.')
    return FlexsmartSDK.envURLs[this.env];
  }

  private async validateKey(): Promise<boolean> {
    if (!this.apiKey) {
      // @ts-ignore
      throw new Error('API key is required.', { cause: Errors.MissingApiKey });
    }
    if (this.validApiKey) {
      return true;
    }
    try {
      const result = await axios.get(`${this.getURL()}${APIKEY_VALIDATE}`, {
        withCredentials: true,
        headers: {
          'x-api-key': this.apiKey,
        },
      });
      this.validApiKey = result.status === 200;
      if (this.validApiKey) {
        return this.validApiKey;
      }
    } catch(error) {}
    // @ts-ignore
    throw new Error('The given API key is invalid', { cause: Errors.InvalidApiKey });
  }

  private saveContract(contract: DeployedContract): Promise<any> {
    const { name, symbol, type, chain, network, initialSupply, transaction, status, isFullFeature } = contract;
    return axios.post(`${this.getURL()}${CONTRACTS}`, {
      name,
      symbol,
      type,
      chain,
      network,
      initialSupply,
      transaction,
      status,
      isFullFeature,
      source: 1,
    }, {
      withCredentials: true,
      headers: {
        'x-api-key': this.apiKey,
      }
    });
  }
  
  private withValidKey = (next) => async (...props) => {
    const isValid = await this.validateKey()
    if (isValid) {
      return next(...props)
    }
  }

  // TODO: find a better place for this function
  private _deployERC20 = async (props: CreateContract) => {
    const { name, symbol, initialSupply = 0.0, decimals = 18, isFullFeature } = props;
    try {
      const abi = isFullFeature ? erc20ABI : erc20ABIMin;
      const supply = toErc20Supply(initialSupply, decimals);
      const erc20Factory = new ContractFactory(abi.abi, abi.bytecode, this.rpcConnection.getSigner());
      const contract =  await erc20Factory.deploy(name, symbol, supply);
      const chainId = await this.rpcConnection.getSigner().getChainId();
      const chanInHex = utils.hexlify(chainId);
      // TODO: find out the right order to handle this transactionally, if one of them fail make them all fail
      // TODO: make this url point to our dev
      return this.saveContract({
        name,
        symbol,
        type: ContractType.erc20,
        chain: ContractChain.ethereum,
        network: chanInHex,
        initialSupply: supply,
        transaction: contract.deployTransaction.hash,
        status: 'submitted',
        isFullFeature,
      });
    } catch(error) {
      throw error;
    }
  }

  // TODO: find a better place for this function
  private _deployERC777 = async (props: CreateContract) => {
    const { name, symbol, initialSupply = 0.0, decimals = 18 } = props;
    try {
      const abi = erc777ABIMin;
      const supply = toErc20Supply(initialSupply, decimals);
      const erc20Factory = new ContractFactory(abi.abi, abi.bytecode, this.rpcConnection.getSigner());
      const contract =  await erc20Factory.deploy(name, symbol, supply);
      const chainId = await this.rpcConnection.getSigner().getChainId();
      const chanInHex = utils.hexlify(chainId);
      // TODO: find out the right order to handle this transactionally, if one of them fail make them all fail
      // TODO: make this url point to our dev
      return this.saveContract({
        name,
        symbol,
        type: ContractType.erc777,
        chain: ContractChain.ethereum,
        network: chanInHex,
        initialSupply: supply,
        transaction: contract.deployTransaction.hash,
        status: 'submitted',
        isFullFeature: false,
      });
    } catch(error) {
      throw error;
    }
  }

  // TODO: find a better place for this function
  private _deployBEP20 = async (props: CreateContract) => {
    const { name, symbol, initialSupply = 0.0, decimals = 18, isFullFeature } = props;
    try {
      const abi = isFullFeature ? bep20ABI : bep20ABIMin;
      const supply = toErc20Supply(initialSupply, decimals);
      const erc20Factory = new ContractFactory(abi.abi, abi.bytecode, this.rpcConnection.getSigner());
      const contract =  await erc20Factory.deploy(name, symbol, supply);
      const chainId = await this.rpcConnection.getSigner().getChainId();
      const chanInHex = utils.hexlify(chainId);
      // TODO: find out the right order to handle this transactionally, if one of them fail make them all fail
      // TODO: make this url point to our dev
      return this.saveContract({
        name,
        symbol,
        type: ContractType.bep20,
        chain: ContractChain.binance,
        network: chanInHex,
        initialSupply: supply,
        transaction: contract.deployTransaction.hash,
        status: 'submitted',
        isFullFeature,
      });
    } catch(error) {
      throw error;
    }
  }

  // TODO: find a better place for this function
  private _deployEscrow = async (props: CreateEscrow) => {
    try {
      const {
        arbiterAddress,
        buyerAddress,
        buyerEmail,
        sellerAddress,
        sellerEmail,
        arbiterEmail,
        arbiterPercentage,
        autoReleaseWaitDays,
        contractAmount,
        description,
        currencyToken,
      } = props;
      const chainId = await this.rpcConnection.getSigner().getChainId();
      const networkHex = utils.hexlify(chainId);
      const erc20ContractToken = getErc20ContractAddress(currencyToken, networkHex);
      const escrowLibrary = libraryAddressesByChainId[networkHex];
      assert.ok(currencyToken === EscrowToken.USDT, 'Invalid currency token.');
      assert.ok(erc20ContractToken, 'Unable to obtain the USDT Token address.');
      assert.ok(arbiterPercentage >=0, "Invalid arbiter's percentage.");
      assert.ok(escrowLibrary, 'Unable to obtain Escrow library.');
      const percentage = toErc20Supply(arbiterPercentage, 18);
      const escrowLibraryAddress = escrowLibrary.address.replace('0x', '');
      const formattedBytecode = escrowABI.bytecode.replaceAll(
        ERC20_ADDRESS_PLACEHOLDER,
        escrowLibraryAddress,
      );
      const erc20Factory = new ContractFactory(escrowABI.abi, formattedBytecode, this.rpcConnection.getSigner());
      const contract =  await erc20Factory.deploy(
        description,
        erc20ContractToken,
        buyerAddress,
        sellerAddress,
        arbiterAddress,
        percentage,
        autoReleaseWaitDays,
      );
      // TODO: find out the right order to handle this transactionally, if one of them fail make them all fail
      // TODO: make this url point to our dev
      const body: CreateEscrowBody = {
        network: networkHex,
        arbiterAddress,
        arbiterEmail,
        autoReleaseWaitDays,
        buyerEmail,
        buyerAddress,
        contractAmount,
        description,
        erc20ContractToken: currencyToken,
        sellerAddress,
        sellerEmail,
        arbiterPercentageWithEighteenZeros: String(arbiterPercentage),
        transaction: contract.deployTransaction.hash,
      };
      return axios.post(`${this.getURL()}${ESCROWS}`, body, {
        withCredentials: true,
        headers: {
          'x-api-key': this.apiKey,
        }
      });
    } catch(error) {
      throw error;
    }
  }

  public deployERC20 = this.withValidKey(this._deployERC20)
  public deployERC777 = this.withValidKey(this._deployERC777)
  public deployBEP20 = this.withValidKey(this._deployBEP20)
  public deployEscrow = this.withValidKey(this._deployEscrow)
}
