import { EIP155_CHAINS, EIP155_SIGNING_METHODS, TEIP155Chain } from 'src/data/EIP155Data.js';
// import { eip155Addresses, eip155Wallets } from '../utils/EIP155WalletUtil'
import {
  getSignParamsMessage,
  getSignTypedDataParamsData,
  getWalletAddressFromParams,
} from './HelperUtil';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { useContract, useContractWrite } from '@thirdweb-dev/react';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { providers } from 'ethers';

export async function approveEIP155Request(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;

  // const wallet = eip155Wallets[getWalletAddressFromParams(eip155Addresses, params)]
  if (!window.ethereum)
    throw new Error(
      'No web3 support detected in your browser: if you created this account through MetaMask, please install it.'
    );
  const provider = new providers.Web3Provider(window.ethereum, 'any');
  const wallet = provider.getSigner('0x7D504D497b0ca5386F640aDeA2bb86441462d109');

  switch (request.method) {
    case EIP155_SIGNING_METHODS.PERSONAL_SIGN:
    case EIP155_SIGNING_METHODS.ETH_SIGN:
      try {
        const message = getSignParamsMessage(request.params);
        const signedMessage = await wallet.signMessage(message);
        return formatJsonRpcResult(id, signedMessage);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V3:
    case EIP155_SIGNING_METHODS.ETH_SIGN_TYPED_DATA_V4:
      try {
        const { domain, types, message: data } = getSignTypedDataParamsData(request.params);
        // https://github.com/ethers-io/ethers.js/issues/687#issuecomment-714069471
        delete types.EIP712Domain;
        const signedData = await wallet._signTypedData(domain, types, data);
        return formatJsonRpcResult(id, signedData);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      try {
        const provider = new providers.JsonRpcProvider(EIP155_CHAINS[chainId as TEIP155Chain].rpc);
        const sendTransaction = request.params[0];

        /** START HERE */
        const { contract } = useContract('0xD27DA5Ea086d3e89EB18CA30090647E3017524Bf');
        const { mutate: submitTransaction, isLoading: submittingTransaction } = useContractWrite(
          contract,
          'submitTransaction'
        );

        const account = wallet._address;
        const target = sendTransaction.to;
        const value = sendTransaction.value;
        const callData = sendTransaction.data;

        submitTransaction({ args: [account, target, value, callData] });
        return;
        /** END HERE */

        // const connectedWallet = wallet.connect(provider);
        // const { hash } = await connectedWallet.sendTransaction(sendTransaction);
        // return formatJsonRpcResult(id, hash);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      try {
        const signTransaction = request.params[0];
        const signature = await wallet.signTransaction(signTransaction);
        return formatJsonRpcResult(id, signature);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    default:
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectEIP155Request(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
