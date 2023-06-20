import { IErrorType } from './error';
import { Transaction } from './transaction';

// ----------------------------------------------------------------------

export type ITransactions = {
  NEW: number;
  REVERTED: number;
  PENDING: number;
  COMPLETED: number;
  FAILED: number;
};

export type IBatches = {
  PENDING: number;
  COMPLETED: number;
  FAILED: number;
};

export type IBilling = {
  email: string;
  paymentMethods: number;
  failedCharges: number;
};

export type IStateState = {
  loading: boolean;
  error: IErrorType;
  clients: number;
  transactions: ITransactions;
  batches: IBatches;
  billing: IBilling;
  userTransactions: Record<string, Transaction>;
};
