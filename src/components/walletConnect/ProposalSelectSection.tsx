import React from 'react';
import { Typography } from '@mui/material';
import AccountSelectCard from 'src/components/walletConnect/AccountSelectCard';

/**
 * Types
 */
// ProposalSelectSection.propTypes = {
//   chain: PropTypes.string,
//   addresses: string[],
//   selectedAddresses: string[] | undefined,
//   onSelect: (chain: string, address: string) => void,
// };

interface IProps {
  chain: string;
  addresses: string[];
  selectedAddresses: string[] | undefined;
  onSelect: (chain: string, address: string) => void;
}

/**
 * Component
 */
export default function ProposalSelectSection({
  addresses,
  selectedAddresses,
  chain,
  onSelect,
}: IProps) {
  return (
    <div>
      <Typography>Your accounts</Typography>
      {addresses.map((address, index) => (
        <AccountSelectCard
          key={address}
          address={address}
          index={index}
          onSelect={() => onSelect(chain, address)}
          selected={selectedAddresses?.includes(address) ?? false}
        />
      ))}
    </div>
  );
}
