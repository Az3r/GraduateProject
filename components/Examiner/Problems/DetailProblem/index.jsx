import { Box, Breadcrumbs, Button, Link, Typography } from '@material-ui/core';
import React from 'react';

export default function DetailProblem({problem}){
    return(
        <Box m={1}>
            <Box p={2}>
                <Breadcrumbs>
                    <Link color="inherit" href="/examiner">
                        Examiner
                    </Link>
                    <Link color="inherit"  href="/examiner/problems">
                        Problems
                    </Link>
                    <Typography color="textPrimary">Detail</Typography>
                </Breadcrumbs>
            </Box>
            <Box display="float" p={2}>
                <Button color="primary" href={`/examiner/problems/update?id=${problem.id}`}>Update</Button>
            </Box>
        </Box>
    )
}