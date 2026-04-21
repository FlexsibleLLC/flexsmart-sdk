import { utils } from 'ethers';
import { ContractChain, SupportedNetwork } from '../types';

export const ETHEREUM_MAINNET: SupportedNetwork = {
  name: 'Ethereum Mainnet',
  chainId: 1,
  chainIdHex: utils.hexValue(1),
  rpcUrl: 'https://ethereum-rpc.publicnode.com',
  currencySymbol: 'ETH',
  blockExplorerUrl: 'https://etherscan.io/',
  chain: ContractChain.ethereum,
};

export const ETHEREUM_SEPOLIA: SupportedNetwork = {
  name: 'Ethereum Sepolia',
  chainId: 11155111,
  chainIdHex: utils.hexValue(11155111),
  rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
  currencySymbol: 'ETH',
  blockExplorerUrl: 'https://sepolia.etherscan.io/',
  chain: ContractChain.ethereum,
};

export const BNB_SMART_CHAIN_MAINNET: SupportedNetwork = {
  name: 'BNB Smart Chain Mainnet',
  chainId: 56,
  chainIdHex: utils.hexValue(56),
  rpcUrl: 'https://bsc-rpc.publicnode.com',
  currencySymbol: 'BNB',
  blockExplorerUrl: 'https://bscscan.com/',
  chain: ContractChain.binance,
};

export const BNB_SMART_CHAIN_TESTNET: SupportedNetwork = {
  name: 'BNB Smart Chain Testnet',
  chainId: 97,
  chainIdHex: utils.hexValue(97),
  rpcUrl: 'https://bsc-testnet-rpc.publicnode.com',
  currencySymbol: 'tBNB',
  blockExplorerUrl: 'https://testnet.bscscan.com/',
  chain: ContractChain.binance,
};

export const POLYGON_MAINNET: SupportedNetwork = {
  name: 'Polygon Mainnet',
  chainId: 137,
  chainIdHex: utils.hexValue(137),
  rpcUrl: 'https://polygon.drpc.org',
  currencySymbol: 'POL',
  blockExplorerUrl: 'https://polygonscan.com/',
  chain: ContractChain.polygon,
};

export const POLYGON_AMOY_TESTNET: SupportedNetwork = {
  name: 'Polygon Amoy Testnet',
  chainId: 80002,
  chainIdHex: utils.hexValue(80002),
  rpcUrl: 'https://rpc-amoy.polygon.technology/',
  currencySymbol: 'MATIC',
  blockExplorerUrl: 'https://amoy.polygonscan.com/',
  faucetUrl: 'https://faucet.polygon.technology/',
  chain: ContractChain.polygon,
};

export const FLEXSMART_NETWORK: SupportedNetwork = {
  name: 'FlexSmart Network',
  chainId: POLYGON_MAINNET.chainId,
  chainIdHex: POLYGON_MAINNET.chainIdHex,
  rpcUrl: POLYGON_MAINNET.rpcUrl,
  currencySymbol: POLYGON_MAINNET.currencySymbol,
  blockExplorerUrl: POLYGON_MAINNET.blockExplorerUrl,
  chain: ContractChain.polygon,
};

export const supportedNetworksByChainId: Record<string, SupportedNetwork> = {
  [ETHEREUM_MAINNET.chainIdHex]: ETHEREUM_MAINNET,
  [ETHEREUM_SEPOLIA.chainIdHex]: ETHEREUM_SEPOLIA,
  [BNB_SMART_CHAIN_MAINNET.chainIdHex]: BNB_SMART_CHAIN_MAINNET,
  [BNB_SMART_CHAIN_TESTNET.chainIdHex]: BNB_SMART_CHAIN_TESTNET,
  [POLYGON_MAINNET.chainIdHex]: POLYGON_MAINNET,
  [POLYGON_AMOY_TESTNET.chainIdHex]: POLYGON_AMOY_TESTNET,
};

export const registerSupportedNetwork = (network: SupportedNetwork): SupportedNetwork => {
  supportedNetworksByChainId[network.chainIdHex] = network;
  return network;
};

export const getSupportedNetworkByChainId = (
  chainId: number | string
): SupportedNetwork | undefined => {
  const chainIdHex =
    typeof chainId === 'number' ? utils.hexValue(chainId) : utils.hexValue(chainId);

  return supportedNetworksByChainId[chainIdHex];
};

export const getContractChainByChainId = (chainId: number | string): ContractChain => {
  const supportedNetwork = getSupportedNetworkByChainId(chainId);

  if (supportedNetwork) {
    return supportedNetwork.chain;
  }

  const chainIdHex = typeof chainId === 'number' ? utils.hexValue(chainId) : utils.hexValue(chainId);

  switch (chainIdHex) {
    case '0x38':
    case '0x61':
      return ContractChain.binance;
    default:
      return ContractChain.ethereum;
  }
};
