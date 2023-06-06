import { IAddressItem } from './address';

// ----------------------------------------------------------------------

export type IWalletTableFilterValue = string | string[] | Date | null;

export type IWalletTableFilters = {
  name: string;
  service: string[];
  status: string;
};

// ----------------------------------------------------------------------

export type IWalletItem = {
  id: string;
  title: string;
  price: number;
  total: number;
  service: string;
  quantity: number;
  description: string;
};

export type IWallet = {
  id: string;
  sent: number;
  status: string;
  totalAmount: number;
  invoiceNumber: string;
  subTotal: number;
  items: IWalletItem[];
  taxes: number | string;
  dueDate: Date | number;
  discount: number | string;
  shipping: number | string;
  createDate: Date | number;
  invoicetTo: IAddressItem;
  invoiceFrom: IAddressItem;
};
