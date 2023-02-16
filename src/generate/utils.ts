#! /usr/bin/env node

const assert = require('node:assert');
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
    padding: 1, 
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

interface IABIReducer {
    [key: string]: string 
};

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
            abiLine.name !== 'decimals' && abiLine.outputs?.some((o) => o.type.includes('int'))
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

const getExports = (contractsDir: string) => {
    const contracts = fs.readdirSync(contractsDir)
        .filter((f: string) => f.endsWith('.js') && f !== 'index.js')
        .map((f: string) => f.replace('.js', ''));
    return contracts.reduce((acc: string, contract: string) => (
        acc + `\nexport { ${contract} } from './${contract}.js';`
    ), '');
}

const logBox = (text) => {
    console.log(boxen(title(text), boxenOptions));
}

const generateContracts = (abis) => {
    const contractsPath = path.join(__dirname, '../.contracts');
    logBox('Creating contracts dir...');
    fsExtra.ensureDirSync(contractsPath);

    // Parse ABIs and generate classes
    const contractMeta = abis.reduce((acc: IABIReducer, abiFile: string) => {
        const [name, contractClass] = parsedABI(abiFile);
        logBox(`Generating ${name} contract`);
        return {
            ...acc,
            [name]: getImports() + contractClass,
        };
    }, {});

    try {
        logBox('Saving contracts to files');
        Object.entries(contractMeta)
            .forEach(([name, content]) => {
                fsExtra.writeFileSync(path.join(__dirname, `../.contracts/${name}.js`), prettier.format(content, { parser: 'babel' }));
                logBox(`Contract ${name}.js successfully created.`);
            });
        const exports = prettier.format(getExports(contractsPath), { parser: 'babel' });
        fsExtra.writeFileSync(path.join(__dirname, `../.contracts/index.js`), exports);
        logBox('Done!');
    } catch (err) {
        console.error(err);
    }
}

const generate = () => {
    const abiDir = path.join(__dirname, '../abis');
    const abis = fs.readdirSync(abiDir)
        .filter((f: string) => f.endsWith('.json'))
        .map((file: string) => path.resolve(abiDir, file));
    generateContracts(abis);
}

const generateFromAbiFile = (abiFile: string) => {
    assert(fsExtra.pathExistsSync(abiFile), 'ABI file not found.');
    generateContracts([
        abiFile
    ])
}

yargs.scriptName("flexsmart")
    .usage('$0 <cmd>')
    .command('generate [file]', 'Generate a contract class from the given ABI', function (yargs) {
        yargs.positional('file', {
            describe: 'JSON file containing an ABI.',
            type: 'string',
            default: '',
        })
    }, (yargs) => {
        if (yargs.file) {
            generateFromAbiFile(yargs.file);
        } else {
            generate();
        }
    })
    .demandCommand(1)
    .help()
    .argv;

