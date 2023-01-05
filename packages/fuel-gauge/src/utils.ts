import { readFileSync } from 'fs';
import type { Interface, JsonAbi, Contract, BytesLike, WalletUnlocked } from 'fuels';
import { NativeAssetId, Provider, TestUtils, ContractFactory } from 'fuels';
import { join } from 'path';

/*
  Wallet
*/
let walletInstance: WalletUnlocked;

async function createWallet() {
  if (walletInstance) return walletInstance;
  const provider = new Provider('http://127.0.0.1:4000/graphql');

  walletInstance = await TestUtils.generateTestWallet(provider, [
    [5_000_000, NativeAssetId],
    [5_000_000, '0x0101010101010101010101010101010101010101010101010101010101010101'],
  ]);

  return walletInstance;
}

/*
  Contract
*/
let contractInstance: Contract;

// instantiate and deploy contract
async function deployContract(factory: ContractFactory, useCache: boolean = true) {
  if (contractInstance && useCache) return contractInstance;
  contractInstance = await factory.deployContract();
  return contractInstance;
}

/*
  Setup
*/
export type SetupConfig = {
  contractBytecode: BytesLike;
  abi: JsonAbi | Interface;
  cache?: boolean;
};

// create wallet, instantiate contract, deploy and return it
export async function setup({ contractBytecode, abi, cache }: SetupConfig) {
  const wallet = await createWallet();
  const factory = new ContractFactory(contractBytecode, abi, wallet);
  const contract = await deployContract(factory, cache);
  return contract;
}

// wraps a setup call, allowing for overrides to be passed to it
export function createSetupConfig(defaultConfig: SetupConfig) {
  return async function wrappedSetup(config?: Partial<SetupConfig>) {
    return setup({
      contractBytecode: defaultConfig.contractBytecode,
      abi: defaultConfig.abi,
      ...config,
    });
  };
}

// Read, group and return contract bytecode and abi
export function readContractFiles(contractName: string): SetupConfig {
  const c = contractName;
  const fullPath = join(__dirname, `../test-projects/${c}/out/debug/${c}`);

  return {
    contractBytecode: readFileSync(`${fullPath}.bin`),
    abi: JSON.parse(readFileSync(`${fullPath}-abi.json`, 'utf8')),
  };
}

// Returns a wrapped setup method that, when called, will
// create the wallet, deploy and return the contract
export function getSetupContract(contractName: string) {
  return createSetupConfig(readContractFiles(contractName));
}
