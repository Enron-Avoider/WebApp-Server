import React, { FunctionComponent, useState, useEffect } from "react";
import { useParams, useRouteMatch, useLocation } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "@apollo/client";
import deepFind from 'deep-find';
import {
    Paper,
    Box,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Button,
    TextField,
    Fab,
    Chip,
    Link,
    SvgIcon
} from '@mui/material';
import { discordSVGPath, discordSVGViewBox } from "@assets/icon-paths/discord";
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';


import "./style.sass";

export const AlphaWarningModal: FunctionComponent<{}> = ({ }) => {

    const { allSearchParams, getNewSearchParamsString, updateParams } = useSearchParams();


    const handleClose = () => {
        updateParams({ search: getNewSearchParamsString({ paramsToAdd: { hideWarning: true } }) });
    };

    return (
        <Dialog open={!allSearchParams.hideWarning} onClose={handleClose}>
            <Box
                minWidth={455}
            >
                <DialogTitle>
                    ⚠️ WARNING!! ⚠️
                </DialogTitle>
                <DialogContent>

                    <Box mt={-2}>
                        <p>
                            This Tool is not ready yet.
                            <br />
                            It'll likely give you more trouble than gratification.
                            <br />
                            <br />
                            That said.. We would love your feedback on whatever you find to be broken or would like us to add!
                            <br />
                            <Link href="https://discord.gg/NBgpx5guRe" color="primary" target="_blank">
                                <Box display="flex" alignItems="center">
                                    <SvgIcon fontSize="inherit" viewBox={discordSVGViewBox}>
                                        <path d={discordSVGPath} />
                                    </SvgIcon>{' '}
                                    Join us!
                                </Box>
                            </Link>

                        </p>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="secondary">
                        Ok
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
