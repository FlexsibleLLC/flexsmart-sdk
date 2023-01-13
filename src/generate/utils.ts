#! /usr/bin/env node

const fs = require('fs');
const fsExtra = require('fs-extra');
const prettier = require('prettier');
const path = require('path');
const yargs = require('yargs');
const chalk = require("chalk");
const boxen = require("boxen");

const boxenOptions = {
    borderStyle: "classic",
    borderColor: "blue",
    backgroundColor: "#555",
    padding: 2, 
    title: 'Flexsmart SDK',
};

const title = chalk.white.bold;

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

const parsedABI = (abiFile: string) => {
    const rawABI = fs.readFileSync(abiFile);
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

    return [abi.contractName, getClass(abi.contractName, functions)];
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
            static contractName = '${name}';
            constructor(contractCore) {
                this.contractCore = contractCore;
            }

            async normalizeAmount(amount) {
                const decimals = await this.contractCore.readonlyContract.decimals();
                return utils.parseUnits(amount, decimals);
            }
            
            async formatAmount(amount) {
                const decimals = await this.contractCore.readonlyContract.decimals();
                return utils.formatUnits(amount, decimals);
            }
        
            onNetworkUpdated(providerOrSigner) {
                this.contractCore.updateProviderOrSigner(providerOrSigner);
            }

            ${functions}
        }
    `;
}

const getImports = () => {
    return `
        import { utils } from 'ethers';
    `;
}

const generate = () => {
    const contractsPath = path.join(__dirname, '../.contracts');
    const creatingDirText = title('Creating contracts dir...');
    const mBox = boxen( creatingDirText, boxenOptions );
    console.log(mBox);

    fsExtra.ensureDirSync(contractsPath);
    const abiDir = path.join(__dirname, '../abis');
    const abis = fs.readdirSync(abiDir).filter((f: string) => f.endsWith('.json'));
    const contractMeta = abis.reduce((contractMeta: {contractClasses: string, nameToABI: {[key: string]: string}[]}, abiFile: string) => {
        const [name, contractClass] = parsedABI(path.resolve(abiDir, abiFile));
        const generatingContractText = title(`Generating ${name} contract`);
        const mBox = boxen( generatingContractText, boxenOptions );
        console.log(mBox);

        return {
            contractClasses: contractMeta.contractClasses + contractClass,
        };
    }, {
        contractClasses: getImports(),
        nameToABI: {},
    })
    
    try {
        const savingContractText = title(`Saving contracts to a file`);
        const mBox = boxen( savingContractText, boxenOptions );
        console.log(mBox);

        fsExtra.writeFileSync(path.join(__dirname, '../.contracts/index.js'), prettier.format(contractMeta.contractClasses, {parser: 'babel'}));        
        const done = boxen( title('Done!'), boxenOptions );
        console.log(done);
    } catch (err) {
        console.error(err);
    }
}


yargs.scriptName("flexsmart")
    .usage('$0 <cmd>')
    .command('generate', 'Generate contracts from ABIs', (yargs) => {
        generate();
    })
    .help()
    .argv;

