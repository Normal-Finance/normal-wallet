import React from 'react';
import { Container, Modal, Typography } from '@mui/material';
import { Fragment, ReactNode } from 'react';

/**
 * Types
 */
interface IProps {
  title: string;
  children: ReactNode | ReactNode[];
}

/**
 * Component
 */
export default function RequestModalContainer({ children, title }: IProps) {
  return (
    <div>
      {/* <Modal.Header> */}
      <Typography>{title}</Typography>
      {/* </Modal.Header> */}

      {/* <Modal.Body> */}
      <Container>{children}</Container>
      {/* </Modal.Body> */}
    </div>
  );
}
