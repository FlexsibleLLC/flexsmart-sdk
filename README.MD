# FlexSmart SDK
Small SDK to deploy and manage your contracts through the [FlexSmart](https://hub.flexsmart.io) platform.

### Installation
```
npm install @flexsmart/flexsmart-sdk
```

### Generate Contracts
Running the following command would generate the classes for the contracts currently available at FlexSmart.
```
npx flexsmart generate
```

You could generate the contract for your own ABIs by running the following command.
```
npx flexsmart generate /path/to/the/contractABI.json
```

### Deploy Contracts
You can deploy contracts via the SDK and manage them later on the [FlexSmart](https://hub.flexsmart.io) platform.

Deploy an ERC20 token:
```js
import { FlexsmartSDK } from '@flexsmart/flexsmart-sdk';
...
const sdk = new FlexsmartSDK(web3Signer);
sdk.setAPIKey('YOUR-API-KEY');
const result = await sdk.deployERC20({
  name: 'SDK Coin',
  symbol: 'SDKCOIN',
  initialSupply: 10000,
  isFullFeature: true,
  decimals: 18,
});
...
```

Deploy an BEP20 token:
```js
import { FlexsmartSDK } from '@flexsmart/flexsmart-sdk';
...
const sdk = new FlexsmartSDK(web3Signer);
sdk.setAPIKey('YOUR-API-KEY');
const result = await sdk.deployBEP20({
  name: 'SDK Coin',
  symbol: 'SDKCOIN',
  initialSupply: 10000,
  isFullFeature: true,
  decimals: 18,
});
...
```

Deploy an ERC777 token:
```js
import { FlexsmartSDK } from '@flexsmart/flexsmart-sdk';
...
const sdk = new FlexsmartSDK(web3Signer);
sdk.setAPIKey('YOUR-API-KEY');
const result = await sdk.deployERC777({
  name: 'SDK Coin',
  symbol: 'SDKCOIN',
  initialSupply: 400,
  decimals: 18,
});
...
```

Deploy an Escrow contract:
```js
import { FlexsmartSDK, EscrowToken } from '@flexsmart/flexsmart-sdk';
...
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
...
```

### Manage Contracts
You could manage your deployed contracts quick and easy with the FlexSmart SDK.

Manage an ERC20 Token
```js
import { Erc20TokenAll } from '@flexsmart/flexsmart-sdk/dist/.contracts';
...
const sdk = new FlexsmartSDK(web3Signer);
const erc20Contract = await sdk.getContract(
  '0x1234567890123456789012345678901234567890', // Contract address
  Erc20TokenAll,
);
await erc20Contract.decimals();
await erc20Contract..mint('0x1234567890123456789012345678901234567890', 500);
...
```

Manage a BEP20 Token
```js
import { Bep20TokenAll } from '@flexsmart/flexsmart-sdk/dist/.contracts';
...
const sdk = new FlexsmartSDK(web3Signer);
const bep20Contract = await sdk.getContract(
  '0x1234567890123456789012345678901234567890', // Contract address
  Bep20TokenAll,
);
await bep20Contract.decimals();
await bep20Contract.mint('0x1234567890123456789012345678901234567890', 500);
...
```

Manage an ERC777 Token
```js
import { Erc777TokenBasic } from '@flexsmart/flexsmart-sdk/dist/.contracts';
...
const sdk = new FlexsmartSDK(web3Signer);
const erc777Contract = await sdk.getContract(
  '0x1234567890123456789012345678901234567890', // Contract address
  Erc777TokenBasic,
);
await erc777Contract.decimals();
await erc777Contract.transfer('0x1234567890123456789012345678901234567890', 500);
...
```

Manage an Escrow contract
```js
import { TokenEscrow } from '@flexsmart/flexsmart-sdk/dist/.contracts';
...
const sdk = new FlexsmartSDK(web3Signer);
const escrowContract = await sdk.getContract(
  '0x1234567890123456789012345678901234567890', // Contract address
  TokenEscrow,
);
await escrowContract.buyerAddress();
await escrowContract.resolveDispute(50);
...
```

### TODO

- Add network update listener/trigger
- Add events
- Add tests
- Allow the sdk to be instantiated just with the network
