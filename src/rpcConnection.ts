import { Signer, providers } from 'ethers';
import { ProviderOrSigner } from './types';

export class RPCConnection {
  private provider: providers.Provider;
  private signer: Signer | undefined;

  constructor(providerOrSigner: ProviderOrSigner) {
    [this.provider, this.signer] = this.getProviderAndSigner(providerOrSigner);
  }

  private getProviderAndSigner(
    providerOrSigner: ProviderOrSigner
  ): [providers.Provider, Signer | undefined] {
    let signer: Signer | undefined;
    let provider: providers.Provider | undefined;

    if (Signer.isSigner(providerOrSigner)) {
      signer = providerOrSigner;

      if (providerOrSigner.provider) {
        return [providerOrSigner.provider, signer];
      }
    }

    if (providers.Provider.isProvider(providerOrSigner)) {
      return [providerOrSigner, signer];
    }

    // TODO: handle network instead of just signer/provider and use a default one when there is not a match

    return [provider, signer];
  }

  public updateProviderOrSigner(providerOrSigner: ProviderOrSigner) {
    [this.provider, this.signer] = this.getProviderAndSigner(providerOrSigner);
  }

  public getSigner(): Signer | undefined {
    return this.signer;
  }

  public getProvider(): providers.Provider {
    return this.provider;
  }
}
