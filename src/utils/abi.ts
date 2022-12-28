import { ABI, IABIItem, features } from '../types';

const nameToFeature = {
  mint: 'mintable',
  burn: 'burnable',
  pause: 'pausable',
};

export const getFeatures = (abi: ABI) => {
  return abi.reduce<features>(
    (f: features, abiItem: IABIItem) => {
      if (
        abiItem.type !== 'function' ||
        !abiItem.stateMutability ||
        Object.keys(nameToFeature).includes(abiItem.name)
      )
        return f;

      return { ...f, [nameToFeature[abiItem.name]]: true };
    },
    {
      mintable: false,
      burnable: false,
      pausable: false,
    }
  );
};