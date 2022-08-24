import { sha256 } from '@ethersproject/sha2';
import { ZeroBytes32 } from '@fuel-ts/constants';
import { toHex, toNumber } from '@fuel-ts/math';
import type { Transaction } from '@fuel-ts/transactions';
import {
  ReceiptType,
  InputType,
  OutputType,
  TransactionType,
  TransactionCoder,
} from '@fuel-ts/transactions';

import type { TransactionResultReceipt } from './transaction-response';

export const getSignableTransaction = (transaction: Transaction): Transaction => {
  const signableTransaction = { ...transaction } as Transaction;
  switch (signableTransaction.type) {
    case TransactionType.Script: {
      signableTransaction.receiptsRoot = ZeroBytes32;
      break;
    }
    case TransactionType.Create: {
      break;
    }
    default: {
      throw new Error('Not implemented');
    }
  }

  signableTransaction.inputs = signableTransaction.inputs.map((input) => {
    if (input.type === InputType.Contract) {
      return {
        ...input,
        utxoID: {
          transactionId: ZeroBytes32,
          outputIndex: 0,
        },
        balanceRoot: ZeroBytes32,
        stateRoot: ZeroBytes32,
      };
    }
    return input;
  });

  signableTransaction.outputs = signableTransaction.outputs.map((output) => {
    switch (output.type) {
      case OutputType.Contract: {
        return {
          ...output,
          balanceRoot: ZeroBytes32,
          stateRoot: ZeroBytes32,
        };
      }
      case OutputType.Change: {
        return {
          ...output,
          amount: toHex(0),
        };
      }
      case OutputType.Variable: {
        return {
          ...output,
          to: ZeroBytes32,
          amount: toHex(0),
          assetId: ZeroBytes32,
        };
      }
      default: {
        return output;
      }
    }
  });

  return signableTransaction;
};

export const getTransactionId = (transaction: Transaction): string => {
  const signableTransaction = getSignableTransaction(transaction);

  const encodedTransaction = new TransactionCoder().encode(signableTransaction);

  return sha256(encodedTransaction);
};

export const calculatePriceWithFactor = (
  gasUsed: string,
  gasPrice: string,
  priceFactor: string
): string => toHex(Math.ceil(toNumber(gasUsed) / toNumber(priceFactor)) * toNumber(gasPrice));

// BigInt(Math.ceil(Number(gasUsed) / Number(priceFactor))) * gasPrice;

export const getGasUsedFromReceipts = (receipts: Array<TransactionResultReceipt>): string => {
  const scriptResult = receipts.find((receipt) => receipt.type === ReceiptType.ScriptResult);

  if (scriptResult && scriptResult.type === ReceiptType.ScriptResult) {
    return scriptResult.gasUsed;
  }

  return toHex(0);
};
