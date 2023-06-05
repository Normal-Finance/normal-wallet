import React from 'react';
import { Typography } from '@mui/material';
import { ProposalTypes } from '@walletconnect/types';

import ChainCard from 'src/components/walletConnect/ChainCard';
import { EIP155_MAINNET_CHAINS, EIP155_TEST_CHAINS } from 'src/data/EIP155Data';
import { formatChainName } from 'src/utils/walletConnect/HelperUtil';

/**
 * Utilities
 */
const CHAIN_METADATA = {
  ...EIP155_MAINNET_CHAINS,
  ...EIP155_TEST_CHAINS,
};

/**
 * Types
 */
interface IProps {
  requiredNamespace: ProposalTypes.RequiredNamespace;
}

/**
 * Component
 */
export default function SessionProposalChainCard({ requiredNamespace }: IProps) {
  return (
    <div>
      {requiredNamespace.chains?.map((chainId) => {
        const rgb = CHAIN_METADATA[chainId]?.rgb;

        return (
          <ChainCard key={chainId} rgb={rgb ?? ''} flexDirection="col" alignItems="flex-start">
            <Typography>{formatChainName(chainId)}</Typography>

            <Typography>Methods</Typography>
            <Typography color="$gray300">
              {requiredNamespace.methods.length ? requiredNamespace.methods.join(', ') : '-'}
            </Typography>

            <Typography>Events</Typography>
            <Typography color="$gray300">
              {requiredNamespace.events.length ? requiredNamespace.events.join(', ') : '-'}
            </Typography>
          </ChainCard>
        );
      })}
    </div>
  );
}
