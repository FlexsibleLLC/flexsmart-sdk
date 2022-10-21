import { BigNumber } from 'ethers';

import { RPCConnection } from './rpcConnection';
import { ProviderOrSigner } from './types';

export class FlexsmartWallet {
  private rpcConnection: RPCConnection;

  constructor(providerOrSigner: ProviderOrSigner) {
    this.rpcConnection = new RPCConnection(providerOrSigner);
  }

  async balance(addressToken: string | undefined): Promise<BigNumber> {
    const provider = this.rpcConnection.getProvider();
    let balance: BigNumber;
    if (!addressToken) {
      balance = await provider.getBalance(await this.getAddress());
    }

    // handle the Erc20 balance

    return BigNumber.from(balance);
  }

  private async getAddress() {
    const signer = this.rpcConnection.getSigner();

    return await signer.getAddress();
  }

  public connect(providerOrSigner: ProviderOrSigner) {
    this.rpcConnection.updateProviderOrSigner(providerOrSigner);
    // emit event to reflect this
  }
}
