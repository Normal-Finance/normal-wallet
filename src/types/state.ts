import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type IClients = {
  TOTAL: number;
};

export type ITransactions = {
  NEW: number;
  PENDING: number;
  COMPLETED: number;
};

export type IBatches = {
  INIT: number;
  PENDING: number;
  COMPLETED: number;
};

export type IBilling = {
  emailExists: boolean;
  paymentMethods: number;
  failedCharges: number;
};

export type IStateState = {
  clients: IClients;
  transactions: ITransactions;
  batches: IBatches;
  billing: IBilling;
  appStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
};
