import axios from 'axios';
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

const availableABIs = [
  'Erc20Token',
  'Erc20TokenAll',
  'Bep20Token',
  'Bep20TokenAll',
  'Erc777TokenBasic',
]

export const getABIFromName = async (name: string) => {
  if (!availableABIs.includes(name)) {
    return '';
  }

  const { data } = await axios.get(`https://flexsmart-test-assets-abi.s3.amazonaws.com/${name}.json`);
  if (!data) return '';
  
  return data
};

