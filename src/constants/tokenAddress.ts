const erc20ContractAddresses = [
  {
    token: 'usdt',
    network: '0x1', // Ethereum Mainnet
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  },
  {
    token: 'usdt',
    network: '0x5', // Goerli (ETH) Testnet
    // address: '0xe802376580c10fe23f027e1e19ed9d54d4c9311e',
    address: '0x17547b26cf5dd3c73a62047c9a74d9ceaae323ed', // Our custom USDT for testing.
  },
  {
    token: 'usdt',
    network: '0xaa36a7', // Sepolia (ETH) Testnet
    address: '0x4516125e745218f3634e030d7ae6aC98C02394c2', // Our custom USDT for testing.
  },
  {
    token: 'usdt',
    network: '0x38', // Binance Mainnet
    address: '0x55d398326f99059ff775485246999027b3197955',
  },
  {
    token: 'usdt',
    network: '0x61', // Binance Testnet
    address: '0x15771be6175a305abaf08e3b5be458aa97ab23a6', // Our custom USDT for testing.
  },
];

export const getErc20ContractAddress = (
  tokenP: string,
  networkP: string
): string => {
  return erc20ContractAddresses.find(
    ({ token, network }) => token === tokenP && network === networkP
  )?.address as string;
};
