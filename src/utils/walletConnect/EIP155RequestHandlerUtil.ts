import {
  // EIP155_CHAINS,
  EIP155_SIGNING_METHODS,
  // TEIP155Chain,
} from 'src/hooks/walletConnect/wcConsts';
import { getSignParamsMessage, getSignTypedDataParamsData } from './HelperUtil';
import { formatJsonRpcError, formatJsonRpcResult } from '@json-rpc-tools/utils';
import { SignClientTypes } from '@walletconnect/types';
import { getSdkError } from '@walletconnect/utils';
// import { providers } from 'ethers';
import { useWalletContext } from 'src/contexts/WalletContext';
import { useWebsocketContext } from 'src/contexts/WebsocketContext';

export async function approveEIP155Request(
  requestEvent: SignClientTypes.EventArguments['session_request']
) {
  const { params, id } = requestEvent;
  const { chainId, request } = params;

  if (!window.ethereum)
    throw new Error(
      'No web3 support detected in your browser: if you created this account through MetaMask, please install it.'
    );
  // const provider = new providers.Web3Provider(window.ethereum, 'any');
  // const wallet = provider.getSigner('0x56CB44C27cAf76AdE499F68F12baF1c8ca9e73A5');
  const { smartWallet, smartWalletAddress } = useWalletContext();
  const wallet = await smartWallet.getSigner();

  // TODO: does it need to be done this way?
  // Then you can execute transactions directly
  // const transaction = prepareTransaction();
  // await wallet.execute(transaction);

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
        // const provider = new providers.JsonRpcProvider(EIP155_CHAINS[chainId as TEIP155Chain].rpc);
        const sendTransaction = request.params[0];

        const { newTransaction } = useWebsocketContext();
        newTransaction(
          smartWalletAddress,
          sendTransaction.to,
          sendTransaction.value,
          sendTransaction.data
        );
        return;

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
