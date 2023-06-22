export const enum Priority {
  INSTANT = 'INSTANT', // should be batched asap - prioritizes speed over batch size
  GTC = 'GTC', // should be executed with a full batch - prioritizes batch size over timing
}

export const enum TransactionStatus {
  NEW = 'NEW',
  REVERTED = 'REVERTED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type Transaction = {
  transactionId: string;
  account: string;
  target: string;
  _value: string;
  calldata: string;
  priority: Priority;
  current_status: TransactionStatus;
  batchId: string;
  createdAt: Date | string;
  updatedAt: Date | string | null;
};
