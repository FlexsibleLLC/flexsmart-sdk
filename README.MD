# FlexSmart SDK
Polygon-first SDK for deploying and managing FlexSmart smart contracts through the [FlexSmart](https://hub.flexsmart.io) platform.

### Installation
```bash
npm install @flexsmart/flexsmart-sdk
```

### Polygon First
The SDK is now centered around Polygon-compatible deployment flows.

- `FLEXSMART_NETWORK` points to Polygon Mainnet
- `POLYGON_MAINNET` is supported out of the box
- `POLYGON_AMOY_TESTNET` is supported out of the box
- ERC20 and ERC777 deployments connected to Polygon are saved with `chain: 'polygon'`

```js
import {
  FLEXSMART_NETWORK,
  POLYGON_MAINNET,
  POLYGON_AMOY_TESTNET,
} from '@flexsmart/flexsmart-sdk';

console.log(FLEXSMART_NETWORK);
// {
//   name: 'FlexSmart Network',
//   chainId: 137,
//   chainIdHex: '0x89',
//   rpcUrl: 'https://polygon.drpc.org',
//   currencySymbol: 'POL',
//   blockExplorerUrl: 'https://polygonscan.com/',
//   chain: 'polygon'
// }

console.log(POLYGON_MAINNET);
// {
//   name: 'Polygon Mainnet',
//   chainId: 137,
//   chainIdHex: '0x89',
//   rpcUrl: 'https://polygon.drpc.org',
//   currencySymbol: 'POL',
//   blockExplorerUrl: 'https://polygonscan.com/',
//   chain: 'polygon'
// }

console.log(POLYGON_AMOY_TESTNET);
// {
//   name: 'Polygon Amoy Testnet',
//   chainId: 80002,
//   chainIdHex: '0x13882',
//   rpcUrl: 'https://rpc-amoy.polygon.technology/',
//   currencySymbol: 'MATIC',
//   blockExplorerUrl: 'https://amoy.polygonscan.com/',
//   faucetUrl: 'https://faucet.polygon.technology/',
//   chain: 'polygon'
// }
```

### Recommended Polygon Setup
Use Polygon Mainnet for production and Polygon Amoy for testing.

```js
import { FlexsmartSDK, POLYGON_MAINNET } from '@flexsmart/flexsmart-sdk';
import { providers } from 'ethers';

const provider = new providers.JsonRpcProvider(POLYGON_MAINNET.rpcUrl);
const sdk = new FlexsmartSDK(provider);
```

For wallet-based deployment, connect your signer to one of these Polygon networks first:

- Polygon Mainnet
  - Chain ID: `137`
  - Hex: `0x89`
  - RPC: `https://polygon.drpc.org`
  - Explorer: `https://polygonscan.com/`
  - Currency: `POL`
- Polygon Amoy Testnet
  - Chain ID: `80002`
  - Hex: `0x13882`
  - RPC: `https://rpc-amoy.polygon.technology/`
  - Explorer: `https://amoy.polygonscan.com/`
  - Faucet: `https://faucet.polygon.technology/`
  - Currency: `MATIC`

### Deploy on Polygon
You can deploy contracts via the SDK and manage them later on the [FlexSmart](https://hub.flexsmart.io) platform.

Deploy a tokenization contract on Polygon:
```js
import { FlexsmartSDK } from '@flexsmart/flexsmart-sdk';

const sdk = new FlexsmartSDK(web3Signer);
sdk.setAPIKey('YOUR-API-KEY');

const result = await sdk.deployERC20({
  name: 'SDK Coin',
  symbol: 'SDKCOIN',
  initialSupply: 10000,
  isFullFeature: true,
  decimals: 18,
});
```

Deploy an ERC777 token on Polygon:
```js
import { FlexsmartSDK } from '@flexsmart/flexsmart-sdk';

const sdk = new FlexsmartSDK(web3Signer);
sdk.setAPIKey('YOUR-API-KEY');

const result = await sdk.deployERC777({
  name: 'SDK Coin',
  symbol: 'SDKCOIN',
  initialSupply: 400,
  decimals: 18,
});
```

When connected to Polygon Mainnet or Polygon Amoy, tokenization and ERC777 deployments are saved with:

- `chain: 'polygon'`
- `network: '0x89'` for Polygon Mainnet
- `network: '0x13882'` for Polygon Amoy

### Polygon Escrow Notes
Polygon escrow support depends on both:

- a supported USDT token address for the chain
- a deployed escrow library address for the chain

Polygon Mainnet USDT is configured in the SDK:

```js
import { getErc20ContractAddress } from '@flexsmart/flexsmart-sdk';

const usdtAddress = getErc20ContractAddress('usdt', '0x89');
// 0xc2132D05D31c914a87C6611C10748AEb04B58e8F
```

If your FlexSmart app uses a chain-specific escrow library on Polygon, register it before calling `deployEscrow`:

```js
import {
  registerEscrowLibraryAddress,
  registerErc20ContractAddress,
} from '@flexsmart/flexsmart-sdk';

registerErc20ContractAddress({
  token: 'usdt',
  network: '0x89',
  address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
});

registerEscrowLibraryAddress(
  '0x89',
  'polygon',
  '0xYOUR_DEPLOYED_LIBRARY_ADDRESS'
);
```

Deploy an Escrow contract:
```js
import { FlexsmartSDK, EscrowToken } from '@flexsmart/flexsmart-sdk';

const sdk = new FlexsmartSDK(web3Signer);
sdk.setAPIKey('YOUR-API-KEY');

const result = await sdk.deployEscrow({
  arbiterAddress: '0x1234567890123456789012345678901234567890',
  arbiterEmail: 'arbiter@flexsmart.io',
  arbiterPercentage: 5,
  buyerAddress: '0x1234567890123456789012345678901234567890',
  buyerEmail: 'buyer@flexsmart.io',
  sellerAddress: '0x1234567890123456789012345678901234567890',
  sellerEmail: 'seller@flexsmart.io',
  autoReleaseWaitDays: 14,
  contractAmount: 1500,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
  currencyToken: EscrowToken.USDT,
});
```

### FlexSmart Network Alias
The SDK exports `FLEXSMART_NETWORK` as a stable alias for the default FlexSmart-compatible Polygon network.

If the app later moves to a dedicated or updated network, you can register it at runtime:

```js
import {
  ContractChain,
  registerSupportedNetwork,
} from '@flexsmart/flexsmart-sdk';

registerSupportedNetwork({
  name: 'FlexSmart Network',
  chainId: 137,
  chainIdHex: '0x89',
  rpcUrl: 'https://polygon.drpc.org',
  currencySymbol: 'POL',
  blockExplorerUrl: 'https://polygonscan.com/',
  chain: ContractChain.polygon,
});
```

### Generate Contracts
Running the following command generates the classes for the contracts currently available at FlexSmart.

```bash
npx flexsmart generate
```

You can also generate a contract wrapper from your own ABI:

```bash
npx flexsmart generate /path/to/the/contractABI.json
```

### Manage Contracts
You can manage deployed contracts with the FlexSmart SDK.

Manage a tokenization contract:
```js
import { Erc20TokenAll } from '@flexsmart/flexsmart-sdk/dist/.contracts';

const sdk = new FlexsmartSDK(web3Signer);
const erc20Contract = await sdk.getContract(
  '0x1234567890123456789012345678901234567890',
  Erc20TokenAll,
);

await erc20Contract.decimals();
await erc20Contract.mint('0x1234567890123456789012345678901234567890', 500);
```

Manage an ERC777 token:
```js
import { Erc777TokenBasic } from '@flexsmart/flexsmart-sdk/dist/.contracts';

const sdk = new FlexsmartSDK(web3Signer);
const erc777Contract = await sdk.getContract(
  '0x1234567890123456789012345678901234567890',
  Erc777TokenBasic,
);

await erc777Contract.decimals();
await erc777Contract.transfer('0x1234567890123456789012345678901234567890', 500);
```

Manage an Escrow contract:
```js
import { TokenEscrow } from '@flexsmart/flexsmart-sdk/dist/.contracts';

const sdk = new FlexsmartSDK(web3Signer);
const escrowContract = await sdk.getContract(
  '0x1234567890123456789012345678901234567890',
  TokenEscrow,
);

await escrowContract.buyerAddress();
await escrowContract.resolveDispute(50);
```

### Other Supported Networks
Polygon is the primary focus, but the SDK still includes compatibility metadata for:

- Ethereum Mainnet
- Ethereum Sepolia
- BNB Smart Chain Mainnet
- BNB Smart Chain Testnet

### TODO

- Add network update listener/trigger
- Add events
- Add tests
- Allow the sdk to be instantiated just with the network
