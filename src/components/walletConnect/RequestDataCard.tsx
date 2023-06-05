import React from 'react';
import { Typography } from '@mui/material';
import { CodeBlock, codepen } from 'react-code-blocks';

/**
 * Types
 */
interface IProps {
  data: Record<string, unknown>;
}

/**
 * Component
 */
export default function RequestDataCard({ data }: IProps) {
  return (
    // <Row>
    //   <Col>
    <div>
      <Typography>Data</Typography>
      <CodeBlock
        showLineNumbers={false}
        text={JSON.stringify(data, null, 2)}
        theme={codepen}
        language="json"
      />
    </div>
    //   </Col>
    // </Row>
  );
}
