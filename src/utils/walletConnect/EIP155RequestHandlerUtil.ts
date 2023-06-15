import { EIP155_SIGNING_METHODS } from 'src/hooks/walletConnect/wcConsts';
import { getSignParamsMessage, getSignTypedDataParamsData } from './HelperUtil';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
import { SmartWallet } from '@thirdweb-dev/wallets';

export async function approveEIP155Request(
  requestEvent: SignClientTypes.EventArguments['session_request'],
  smartWallet: SmartWallet,
  submitTransactionHandler: any
) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;

  if (!window.ethereum)
    throw new Error(
      'No web3 support detected in your browser: if you created this account through MetaMask, please install it.'
    );

  const smartWalletAddress = await smartWallet.getAddress();
  const wallet = await smartWallet.getSigner();

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
        const signedData = await (wallet as any)._signTypedData(domain, types, data);
        return formatJsonRpcResult(id, signedData);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    case EIP155_SIGNING_METHODS.ETH_SEND_TRANSACTION:
      try {
        const sendTransaction = request.params[0];

        submitTransactionHandler(
          smartWalletAddress,
          sendTransaction.to,
          sendTransaction.value,
          sendTransaction.data
        );

        return formatJsonRpcResult(id, true);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    // TODO: Smart wallet .signTransaction does not work for some reason...
    case EIP155_SIGNING_METHODS.ETH_SIGN_TRANSACTION:
      try {
        const signTransaction = request.params[0];
        // const signature = await wallet.signTransaction(signTransaction);
        // return formatJsonRpcResult(id, signature);
        return formatJsonRpcResult(id, true);
      } catch (error: any) {
        console.error(error);
        alert(error.message);
        return formatJsonRpcError(id, error.message);
      }

    default:
      console.log(request.method);
      throw new Error(getSdkError('INVALID_METHOD').message);
  }
}

export function rejectEIP155Request(request: SignClientTypes.EventArguments['session_request']) {
  const { id } = request;

  return formatJsonRpcError(id, getSdkError('USER_REJECTED').message);
}
