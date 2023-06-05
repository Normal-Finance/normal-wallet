import React from 'react';
import { Typography } from '@mui/material';

/**
 * Types
 */
interface IProps {
  methods: string[];
}

/**
 * Component
 */
export default function RequestMethodCard({ methods }: IProps) {
  return (
    // <Row>
    //   <Col>
    <div>
      <Typography>Methods</Typography>
      <Typography color="$gray400">{methods.map((method) => method).join(', ')}</Typography>
    </div>
    //   </Col>
    // </Row>
  );
}
