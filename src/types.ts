import { providers, Signer } from 'ethers';

export type ProviderOrSigner = providers.Provider | Signer;

interface IFunctionInOut {
  name: string;
  type: string;
}

export interface IABIItem {
  name: string;
  type: string;
  inputs: { [key: string]: IFunctionInOut }[];
  outputs?: { [key: string]: IFunctionInOut }[];
  stateMutability?: string;
}

export type ABI = IABIItem[];

export type features = {
  mintable: boolean;
  burnable: boolean;
  pausable: boolean;
};

export enum ContractType {
  erc20 = 'erc20',
  bep20 = 'bep20',
  erc777 = 'erc777',
}

export enum ContractChain {
  ethereum = 'ethereum',
  binance = 'binance',
}

export type DeployedContract = {
  name: string;
  symbol: string;
  initialSupply: string;
  chain: ContractChain;
  network: string;
  type: ContractType;
  status: string;
  transaction: string;
  isFullFeature: boolean;
}

export interface CreateContract {
  name: string;
  symbol: string;
  initialSupply?: number;
  isFullFeature?: boolean;
  decimals?: number;
}

export enum EscrowToken {
  USDT = 'usdt',
}

export interface CreateEscrow {
  arbiterAddress: string;
  buyerAddress: string;
  buyerEmail: string;
  sellerAddress: string;
  sellerEmail: string;
  arbiterEmail: string;
  arbiterPercentage: number;
  autoReleaseWaitDays: number;
  contractAmount: number;
  description: string;
  currencyToken: EscrowToken;
}

export interface CreateEscrowBody {
  network: string;
  arbiterAddress: string;
  buyerAddress: string;
  buyerEmail: string;
  sellerAddress: string;
  sellerEmail: string;
  arbiterEmail: string;
  arbiterPercentageWithEighteenZeros: string;
  autoReleaseWaitDays: number;
  contractAmount: number;
  description: string;
  erc20ContractToken: string;
  transaction: string;
}
