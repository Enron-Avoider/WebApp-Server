import React from "react";
import { useParams, Link, useHistory, useLocation } from "react-router-dom";
import { Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import "./style.sass";

export default function NewCalcRowButton({ title, ticker, collectionName }: { title: string, ticker: string, collectionName: string }) {

    const history = useHistory();
    const location = useLocation();
    const { allSearchParams, getNewSearchParamsString, updateParams } = useSearchParams();

    const handleClickOpen = () => updateParams({
        search: getNewSearchParamsString({ paramsToAdd: { ratio: 'new', ticker, ratioCollection: collectionName } })
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
