import React from "react";
import { useParams, Link, useHistory, useLocation } from "react-router-dom";
import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import "./style.sass";

export default function NewCalcRowButton({ title, ticker }: { title: string, ticker?: string }) {

    const history = useHistory();
    const location = useLocation();
    const { allSearchParams, getNewSearchParamsString } = useSearchParams();

    const handleClickOpen = () => history.push({
        pathname: location.pathname,
        search: getNewSearchParamsString({ paramsToAdd: { ratio: 'new', ticker } })
    });

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
                    onClick={handleClickOpen}
                >
                    <AddIcon />
                </Fab>
            </Box>
        </>
    );
}
