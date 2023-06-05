import React from 'react';

import { EIP155_CHAINS, TEIP155Chain } from 'src/data/EIP155Data';
import { Divider, Typography } from '@mui/material';
import { Fragment } from 'react';

/**
 * Types
 */
interface IProps {
  chains: string[];
  protocol: string;
}

/**
 * Component
 */
export default function RequesDetailsCard({ chains, protocol }: IProps) {
  return (
    <Fragment>
      {/* <Row>
        <Col> */}
      <div>
        <Typography>Blockchain(s)</Typography>
        <Typography color="$gray400">
          {chains.map((chain) => EIP155_CHAINS[chain as TEIP155Chain]?.name ?? chain).join(', ')}
        </Typography>
      </div>
      {/* </Col>
      </Row> */}

      <Divider />

      {/* <Row>
        <Col> */}
      <div>
        <Typography>Relay Protocol</Typography>
        <Typography color="$gray400">{protocol}</Typography>
      </div>
      {/* </Col>
      </Row> */}
    </Fragment>
  );
}
