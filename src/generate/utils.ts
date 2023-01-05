const fs = require('fs');
const fsExtra = require('fs-extra');
const prettier = require('prettier');

interface IABI {
    name?: string;
    type: string;
    inputs: { name: string, type: string }[];
    outputs?: { type: string }[];
    stateMutability?: string;
}

interface IFormattedABI {
    name: string;
    inputs: { [key: string]: { type: string } }[];
    stateMutability?: string;
}

// TODO: use this to generate type def
const solidityTS = {'bool': 'boolean', 'address': 'string'};
const solidityTypeToTS = (name: string, sourceType: string): string => {
    if (sourceType.includes('int') || sourceType.includes('fix')) return 'number';

    // TODO: see how to convert a function expecting a byte
    if (sourceType.includes('bytes')) return 'Array';

    return solidityTS[sourceType];
}

const parsedABI = () => {
    // TODO: set the abis dynamically
    const rawABI = fs.readFileSync('./src/abis/erc20.json');
    const abi = JSON.parse(rawABI);
    const functions = abi.abi.reduce((acc: string, abiLine: IABI) => {
        if (abiLine.type !== 'function') return acc;

        const inputs = abiLine.inputs.map((i) => i.name);
        const abiFunc = getFunction(
            abiLine.name, 
            inputs, 
            ['pure', 'view'].includes(abiLine.stateMutability),
            abiLine.outputs?.some((o) => o.type.includes('int'))
        );
        return acc + abiFunc;
    }, '');

    return getClass('ERC20', functions);
}

const getFunction = (name: string, inputs: string[], readonly: boolean = false, formatOutput: boolean = false): string => {
    const inputsWithOutAmount = inputs.filter(i => i !== 'amount');

    if (readonly) {
        return `
            async ${name}(${inputs.join(',')}) {
                const result = await this.contractCore.readonlyContract.${name}(${inputs.join(',')});
                return ${formatOutput ? 'await this.formatAmount(result)': 'result'};
            }
        `;
    }

    const amountExists = inputsWithOutAmount.length !== inputs.length;
    return `
        async ${name}(${inputs.join(',')}) {
            return {
                receipt: await this.contractCore.sendTransaction('${name}', [
                  ${inputsWithOutAmount.length ? inputsWithOutAmount.join(',') + ',': ''}
                  ${amountExists ? 'await this.normalizeAmount(amount),': ''}
                ]),
              };
        }
    `;
}

const getClass = (name: string, functions: string): string => {
    return `
        export class ${name} { 
            constructor(contractCore) {
                this.contractCore = contractCore;
            }
        
            // TODO: use a base contract class to handle this share functionality
            onNetworkUpdated(providerOrSigner) {
                this.contractCore.updateProviderOrSigner(providerOrSigner);
            }

            ${functions}
        }
    `;
}

const generate = () => {
    fsExtra.ensureDirSync('.flexsmart-sdk');
    // TODO: add abis paths to allow dynamic files
    const contractClass = prettier.format(parsedABI());
    try {
        fsExtra.writeFileSync('.flexsmart-sdk/index.js', contractClass);
      } catch (err) {
        console.error(err);
    }
}

generate();
