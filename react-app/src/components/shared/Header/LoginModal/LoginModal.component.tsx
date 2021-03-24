import React, { FunctionComponent, useState, useEffect } from "react";
import { useParams, useRouteMatch, useLocation } from "react-router-dom";
import { useQuery, useMutation, useLazyQuery } from "react-apollo";
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
    Link
} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { GET_USER_BY_ID } from '@state/byModel/User/User.queries';
import { GET_USER_KEYS, ADD_USER_KEY } from "@state/byModel/User/UserKey.localQueries";
import { doCalculations, scopeToRows, CalculationType } from '@state/byModel/Calculations/calculations.map';
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';

import "./style.sass";

export const LoginModal: FunctionComponent<{}> = ({ }) => {

    const [userKeyValue, setUserKeyValue] = useState('');
    const [isinvalidKeyError, setIsInvalidKeyError] = useState(false);
    const { loading: UserKeyLoading, error: UserKeyError, data: UserKeyData } = useQuery(GET_USER_KEYS);
    const [addUserKey] = useMutation(ADD_USER_KEY);

    const { allSearchParams, getNewSearchParamsString, updateParams } = useSearchParams();

    const [getUser, { loading, error, data }] = useLazyQuery(GET_USER_BY_ID);
    // const [saveRatioCollection] = useMutation(SAVE_RATIO_COLLECTION);

    // console.log({ UserKeyData });

    useEffect(() => {
        // console.log({
        //     user: data?.getUserById
        // });

        if (data?.getUserById) {
            addUserKey({
                variables: {
                    id: userKeyValue
                }
            });
            handleClose();
        } else if (data) {
            setIsInvalidKeyError(true);
        }
    }, [data?.getUserById]);

    const handleClose = () => {
        updateParams({ search: getNewSearchParamsString({ keysToRemove: ['isRegistering'] }) })
    };

    const handleLogin = () => {
        getUser({ variables: { id: userKeyValue } });
    }

    return (
        <Dialog open={!!allSearchParams.isRegistering} onClose={handleClose}>
            <Box
                minWidth={450}
            >
                <DialogTitle>
                    Enter User Key
                </DialogTitle>
                <DialogContent>

                    <Box mt={-2}>
                        <p>
                            You only need to be logged in if you'd like to create
                            and edit your own Ratio Collections.
                        <br />
                        To get your own User Key please send a nice email to:
                        {' '}
                            <Link href="mailto:pedro@enronavoider.com?subject=Brave%20New%20User&body=I'd like an account please." color="primary" target="_blank">
                                pedro@enronavoider.com
                        </Link>
                        </p>
                    </Box>

                    <Box display="flex" justifyContent="space-around">

                        <Box flex={1}>
                            <form>
                                <TextField
                                    label="User Key"
                                    fullWidth
                                    // size="small"
                                    // variant="outlined"
                                    value={userKeyValue}
                                    onChange={(event: any) => {
                                        setUserKeyValue(event.target.value);
                                    }}
                                    name="one-time-code"
                                />
                            </form>
                        </Box>

                    </Box>

                    <Box p={2}></Box>

                    {isinvalidKeyError && (
                        <p>We couldn't find anyone with that key.</p>
                    )}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleLogin} color="secondary">
                        Login
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}
