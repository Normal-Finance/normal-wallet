import React from 'react';
import { Avatar, Link, Typography } from '@mui/material';

/**
 * Components
 */
export default function ProjectInfoCard({ metadata }) {
  const { icons, name, url } = metadata;

  return (
    <>
      <Avatar src={icons[0]} />

      <Typography>{name}</Typography>
      <Link href={url}>{url}</Link>
    </>
  );
}
