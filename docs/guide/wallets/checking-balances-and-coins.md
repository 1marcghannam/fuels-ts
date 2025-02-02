---
title: "Checking Balances And Coins"
parent: "Wallets"
grand_parent: "Guide"
---

[info]: this file is autogenerated
# Checking balances and coins

First, one should remember that, with UTXOs, each _coin_ is unique. Each UTXO corresponds to a unique _coin_, and said _coin_ has a corresponding _amount_ (the same way a dollar bill has either 10$ or 5$ face value). So, when you want to query the balance for a given asset ID, you want to query the sum of the amount in each unspent coin. This querying is done very easily with a wallet:


```typescript
  import { Wallet, WalletUnlocked, BigNumberish} from 'fuels';
  const balance: BigNumberish = await myWallet.getBalance(NativeAssetId);
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L181-L184)

---


If you want to query all the balances (i.e., get the balance for each asset ID in that wallet), then it is as simple as:


```typescript
  import { Wallet, WalletUnlocked, CoinQuantity} from 'fuels';
  const balances: CoinQuantity[] = await myWallet.getBalances();
```
###### [see code in context](https://github.com/FuelLabs/fuels-ts/blob/master/packages/fuel-gauge/src/doc-examples.test.ts#L186-L189)

---

