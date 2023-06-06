import { IErrorType } from './error';

// ----------------------------------------------------------------------

export type ITransaction = {
  NEW: number;
  PENDING: number;
  COMPLETED: number;
};

export type IBatch = {
  INIT: number;
  PENDING: number;
  COMPLETED: number;
};

export type IStateState = {
  connection: any;
  transaction: ITransaction;
  batch: IBatch;
  appStatus: {
    loading: boolean;
    empty: boolean;
    error: IErrorType;
  };
};
