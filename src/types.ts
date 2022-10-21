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
