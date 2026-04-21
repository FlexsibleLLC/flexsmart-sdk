interface Erc20ContractAddress {
  token: string;
  network: string;
  address: string;
}

const erc20ContractAddresses: Erc20ContractAddress[] = [
  {
    token: 'usdt',
    network: '0x1', // Ethereum Mainnet
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
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
    network: '0x89', // Polygon Mainnet
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  },
  {
    token: 'usdt',
    network: '0x61', // Binance Testnet
    address: '0x15771be6175a305abaf08e3b5be458aa97ab23a6', // Our custom USDT for testing.
  },
];

export const registerErc20ContractAddress = (
  tokenAddress: Erc20ContractAddress
): Erc20ContractAddress => {
  const existingTokenIndex = erc20ContractAddresses.findIndex(
    ({ token, network }) =>
      token === tokenAddress.token && network === tokenAddress.network
  );

  if (existingTokenIndex >= 0) {
    erc20ContractAddresses[existingTokenIndex] = tokenAddress;
  } else {
    erc20ContractAddresses.push(tokenAddress);
  }

  return tokenAddress;
};

export const getErc20ContractAddress = (
  tokenP: string,
  networkP: string
): string => {
  return erc20ContractAddresses.find(
    ({ token, network }) => token === tokenP && network === networkP
  )?.address as string;
};
