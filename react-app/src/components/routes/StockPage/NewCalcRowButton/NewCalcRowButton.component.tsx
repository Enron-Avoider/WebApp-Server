import React from "react";
import { useParams, Link } from "react-router-dom";
import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import "./style.sass";

export default function NewCalcRowButton({ title }: { title: string }) {

    const { ticker } = useParams();

    const path = `/stock/${ticker}/calculations/${title}`;

    return (
        <>
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                m={-1}
                mb={-3}
            >
                <Fab
                    size="small"
                    color="primary"
                    aria-label="add"
                    // onClick={handleClickOpen}
                    component={Link}
                    to={`${path}/new`}
                >
                    <AddIcon />
                </Fab>
            </Box>
        </>
    );
}
