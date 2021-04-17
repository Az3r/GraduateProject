import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';

import { Box, Breadcrumbs, Link, Typography } from '@material-ui/core';
import EditExamination from './EditExamination';

// const useStyles = makeStyles((theme) => ({}));

export default function AddExamination() {
  // const classes = useStyles();

  return (
    <Box m={3}>
      <Breadcrumbs>
        <Link color="inherit" href="/company-groups">
            Company groups
        </Link>
        <Link color="inherit" href="/company-groups/1">
            1
        </Link>
        <Link color="inherit" href="/company-groups/1/examinations">
            Examinations
        </Link>
        <Typography color="textPrimary">Add</Typography>
      </Breadcrumbs>
      <EditExamination examProp={null}/>
    </Box>
  );
}