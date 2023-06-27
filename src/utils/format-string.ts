export function fEtherscanTx(hash: string) {
  return `https://etherscan.io/tx/${hash}`;
}

export function fEtherscanBlock(blockNum: string | number) {
  return `https://etherscan.io/block/${blockNum}`;
}

export function fEtherscanAddress(address: string) {
  return `https://etherscan.io/address/${address}`;
}
