interface EscrowLibAddress {
  [k: string]: { networkName: string; address: string };
}

export const ERC20_ADDRESS_PLACEHOLDER = '__$482c9b3a47f6f0ec86a0b1e1c7231e7eb9$__';

export const libraryAddressesByChainId: EscrowLibAddress = {
  '0x61': {
    networkName: 'bsctestnet',
    address: '0x215b1029F9132ce28Aed51785F58caC522c4A79F',
  },
  '0xaa36a7': {
    networkName: 'sepolia',
    address: '0x83cde6926b37ddc42e2aa1010a920643f81487f4',
  },
};

export const registerEscrowLibraryAddress = (
  chainIdHex: string,
  networkName: string,
  address: string
): { networkName: string; address: string } => {
  const libraryAddress = { networkName, address };
  libraryAddressesByChainId[chainIdHex] = libraryAddress;
  return libraryAddress;
};
