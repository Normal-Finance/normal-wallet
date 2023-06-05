import React from 'react';
import { Card, Checkbox, Typography } from '@mui/material';
import { truncate } from 'src/utils/walletConnect/HelperUtil';

/**
 * Types
 */
interface IProps {
  address: string;
  index: number;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Component
 */
export default function AccountSelectCard({ address, selected, index, onSelect }: IProps) {
  return (
    <Card onClick={onSelect} key={address}>
      <Checkbox color="success" checked={selected} />

      <Typography>{`${truncate(address, 14)} - Account ${index + 1}`} </Typography>
    </Card>
  );
}
