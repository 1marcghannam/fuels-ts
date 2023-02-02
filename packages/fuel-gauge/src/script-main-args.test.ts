import { generateTestWallet } from '@fuel-ts/wallet/test-utils';
import { readFileSync } from 'fs';
import type { BigNumberish } from 'fuels';
import { NativeAssetId, Provider, bn, ScriptFactory } from 'fuels';
import { join } from 'path';

import scriptAbi from '../test-projects/script-main-args/out/debug/script-main-args-abi.json';

import { getScript } from './utils';

const scriptBin = readFileSync(
  join(__dirname, '../test-projects/script-main-args/out/debug/script-main-args.bin')
);

const setup = async () => {
  const provider = new Provider('http://127.0.0.1:4000/graphql');

  // Create wallet
  const wallet = await generateTestWallet(provider, [[5_000_000, NativeAssetId]]);

  return wallet;
};

type Baz = {
  x: number;
};

describe('Script Coverage', () => {
  it('can call script and use main arguments', async () => {
    const wallet = await setup();
    // #region typedoc:script-call-factory
    const scriptInstance = new ScriptFactory<BigNumberish>(scriptBin, scriptAbi).script;
    const foo = 33;

    const { value, logs } = await wallet.callScript<BigNumberish[], BigNumberish>(scriptInstance, [
      foo,
    ]);
    // #endregion

    expect(value.toString()).toEqual(bn(foo).toString());
    expect(logs).toEqual(['u8 foo', 33]);
  });

  it('can call script and use main arguments [two args, read logs]', async () => {
    const wallet = await setup();
    const scriptInstance = getScript<Baz>('script-main-two-args').script;
    const foo = 33;
    const bar: Baz = {
      x: 12,
    };

    const { value, logs } = await wallet.callScript(scriptInstance, [foo, bar]);

    expect(value.toString()).toEqual(bn(foo + bar.x).toString());
    expect(logs).toEqual(['u8 foo', 33, 'u8 bar', 12, 'u8 bar', 12]);
  });

  it('can call script and use main arguments [two args, struct return]', async () => {
    const wallet = await setup();
    const scriptInstance = getScript<Baz>('script-main-return-struct').script;
    const foo = 1;
    const bar: Baz = {
      x: 2,
    };

    const { value } = await wallet.callScript(scriptInstance, [foo, bar]);

    expect(value).toEqual({
      x: 3,
    });
  });

  it('can call script and use main arguments [tx params]', async () => {
    const wallet = await setup();
    const scriptInstance = new ScriptFactory<BigNumberish>(scriptBin, scriptAbi).script;
    const foo = 42;

    expect(async () => {
      await wallet.callScript(scriptInstance, [foo], { gasLimit: 1, gasPrice: 400 });
    }).rejects.toThrow(/gasLimit\(1\) is lower than the required/);
  });
});