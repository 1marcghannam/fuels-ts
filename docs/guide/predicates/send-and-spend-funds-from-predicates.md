---
title: "Send And Spend Funds From Predicates"
parent: "Predicates"
grand_parent: "Guide"
---

[info]: this file is autogenerated
# Send and spend funds from predicates

Let's consider the following predicate example:


```rust
predicate;

use std::{b512::B512, constants::ZERO_B256, ecr::ec_recover_address, inputs::input_predicate_data};

fn extract_pulic_key_and_match(signature: B512, expected_public_key: b256) -> u64 {
    if let Result::Ok(pub_key_sig) = ec_recover_address(signature, ZERO_B256)
    {
        if pub_key_sig.value == expected_public_key {
            return 1;
        }
    }
    0
}

fn main() -> bool {
    let signatures: [B512; 3] = input_predicate_data(0);

    let public_keys = [
        0xd58573593432a30a800f97ad32f877425c223a9e427ab557aab5d5bb89156db0,
        0x14df7c7e4e662db31fe2763b1734a3d680e7b743516319a49baaa22b2032a857,
        0x3ff494fb136978c3125844625dad6baf6e87cdb1328c8a51f35bda5afe72425c,
    ];

    let mut matched_keys = 0;

    matched_keys = extract_pulic_key_and_match(signatures[0], public_keys[0]);
    matched_keys = matched_keys + extract_pulic_key_and_match(signatures[1], public_keys[1]);
    matched_keys = matched_keys + extract_pulic_key_and_match(signatures[2], public_keys[2]);

    matched_keys > 1
}
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/test-projects/predicate-triple-sig/src/main.sw#L1-L33)

---


This predicate accepts three signatures and matches them to three predefined public keys. The `ec_recover_address` function is used to recover the public key from the signatures. If two of three extracted public keys match the predefined public keys, the funds can be spent. Note that the signature order has to match the order of the predefined public keys.

Let's use the SDK to interact with the predicate. First, let's create three wallets with specific keys. Their hashed public keys are already hard-coded in the predicate.


```typescript
  import { Provider, Wallet } from 'fuels';
  import { seedTestWallet } from '@fuel-ts/wallet/test-utils';
  const provider = new Provider('http://127.0.0.1:4000/graphql');
  // Setup a private key
  const PRIVATE_KEY_1 = '0x862512a2363db2b3a375c0d4bbbd27172180d89f23f2e259bac850ab02619301';
  const PRIVATE_KEY_2 = '0x37fa81c84ccd547c30c176b118d5cb892bdb113e8e80141f266519422ef9eefd';
  const PRIVATE_KEY_3 = '0x976e5c3fa620092c718d852ca703b6da9e3075b9f2ecb8ed42d9f746bf26aafb';

  // Create the wallets, passing provider
  const wallet1: WalletUnlocked = Wallet.fromPrivateKey(PRIVATE_KEY_1, provider);
  const wallet2: WalletUnlocked = Wallet.fromPrivateKey(PRIVATE_KEY_2, provider);
  const wallet3: WalletUnlocked = Wallet.fromPrivateKey(PRIVATE_KEY_3, provider);

  const receiver = Wallet.generate({ provider });
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L349-L364)

---


Next, let's add some coins to the wallets.


```typescript
  import { Provider, Wallet } from 'fuels';
  import { seedTestWallet } from '@fuel-ts/wallet/test-utils';
  await seedTestWallet(wallet1, [{ assetId: NativeAssetId, amount: bn(100_000) }]);
  await seedTestWallet(wallet2, [{ assetId: NativeAssetId, amount: bn(20_000) }]);
  await seedTestWallet(wallet3, [{ assetId: NativeAssetId, amount: bn(30_000) }]);
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L366-L372)

---


Now we can load the predicate binary, and prepare some transaction variables.


```typescript
  import { Predicate, NativeAssetId } from 'fuels';
  const AbiInputs = {
    types: [
      {
        typeId: 0,
        type: 'bool',
        components: null,
        typeParameters: null,
      },
      {
        typeId: 1,
        type: '[b512; 3]',
      },
    ],
    functions: [
      {
        inputs: [
          {
            name: 'data',
            type: 1,
            typeArguments: null,
          },
        ],
        name: 'main',
        output: {
          name: '',
          type: 0,
          typeArguments: null,
        },
      },
    ],
    loggedTypes: [],
  };
  const predicate = new Predicate(predicateTriple, AbiInputs);
  const amountToPredicate = 1000;
  const assetId = NativeAssetId;
  const initialPredicateBalance = await provider.getBalance(predicate.address, assetId);
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L374-L412)

---


After the predicate address is generated we can send funds to it. Note that we are using the same `transfer` function as we used when sending funds to other wallets. We also make sure that the funds are indeed transferred.


```typescript
  const response = await wallet1.transfer(predicate.address, amountToPredicate, assetId);
  await response.wait();
  const predicateBalance = await provider.getBalance(predicate.address, assetId);

  // assert that predicate address now has the expected amount to predicate
  expect(bn(predicateBalance)).toEqual(initialPredicateBalance.add(amountToPredicate));
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L414-L421)

---


Alternatively, you can use `Wallet.submitPredicate` to setup a `Predicate` and use funds from the `Wallet` you submitted from.


```typescript
  await wallet1.submitPredicate(predicate.address, 200);
  const updatedPredicateBalance = await provider.getBalance(predicate.address, assetId);

  // assert that predicate address now has the updated expected amount to predicate
  expect(bn(updatedPredicateBalance)).toEqual(
    initialPredicateBalance.add(amountToPredicate).add(200)
  );
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L423-L431)

---


To spend the funds that are now locked in this example's Predicate, we have to provide two out of three signatures whose public keys match the ones we defined in the predicate. In this example, the signatures are generated using a zeroed B256 value.


```typescript
  const dataToSign = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const signature1 = await wallet1.signMessage(dataToSign);
  const signature2 = await wallet2.signMessage(dataToSign);
  const signature3 = await wallet3.signMessage(dataToSign);

  const signatures = [signature1, signature2, signature3];
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L433-L440)

---


After generating the signatures, we can send a transaction to spend the predicate funds. We use the `receiver` wallet as the recipient. We have to provide the predicate byte code and the required signatures. As we provide the correct data, we receive the funds and verify that the amount is correct.


```typescript
  await provider.submitSpendPredicate(predicate, updatedPredicateBalance, receiver.address, [
    signatures,
  ]);

  // check balances
  const finalPredicateBalance = await provider.getBalance(predicate.address, assetId);
  const receiverBalance = await provider.getBalance(receiver.address, assetId);

  // assert that predicate address now has a zero balance
  expect(bn(finalPredicateBalance)).toEqual(bn(0));
  // assert that predicate funds now belong to the receiver
  expect(bn(receiverBalance)).toEqual(bn(updatedPredicateBalance));
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L442-L455)

---

