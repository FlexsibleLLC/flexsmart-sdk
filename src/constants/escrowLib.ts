interface EscrowLibAddress {
  [k: string]: { networkName: string; address: string };
}

export const ERC20_ADDRESS_PLACEHOLDER = '__$482c9b3a47f6f0ec86a0b1e1c7231e7eb9$__';

export const libraryAddressesByChainId: EscrowLibAddress = {
  '0x61': {
    networkName: 'bsctestnet',
    address: '0x215b1029F9132ce28Aed51785F58caC522c4A79F',
  },
  '0x5': {
    networkName: 'goerli',
    address: '0x505cFC51E2b4141A22526E008d278dbBb82dad38',
  },
  '0xaa36a7': {
    networkName: 'sepolia',
    address: '0x83cde6926b37ddc42e2aa1010a920643f81487f4',
  },
};
