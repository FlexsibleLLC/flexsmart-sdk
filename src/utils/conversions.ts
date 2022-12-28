import BigNumberJS from 'bignumber.js';

export const toErc20Supply = (initialSupply: number, decimals: number) => {
    const times = new BigNumberJS(10).pow(decimals);
    return new BigNumberJS(initialSupply).times(times).toFixed(0);
};