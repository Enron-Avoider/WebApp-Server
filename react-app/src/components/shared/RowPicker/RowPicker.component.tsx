import React, { FunctionComponent } from 'react';
import { useQuery } from "@apollo/client";
import {
    Box,
    Chip,
    TextField,
    Autocomplete
} from '@mui/material';
import { useParams, useHistory } from "react-router-dom";
import useSearchParams from '@state/byModel/Global/useSearchParams.effect';
import { GET_ROWS } from '@state/byModel/Rows/Rows.queries';
import getCalculations from '@state/byModel/Calculations/getCalculations.effect';

import './style.sass';


export const RowPicker: FunctionComponent<{}> = ({ }) => {

    const {
        allSearchParams, getNewSearchParamsString, updateParams
    } = useSearchParams();
    const { row, collectionId } = useParams<{ row: string, collectionId?: string }>();

    const history = useHistory();

    const { loading, error, data: rowsData } = useQuery(GET_ROWS);
    const { ratioCollections, pickedCollections } = getCalculations({});

    const tableMap = {
        price: "Price",
        aggregatedShares: "Aggregated Shares",
        bs: "Balance Sheet",
        cf: "Cash Flow",
        pl: "Income Statement",
        marketCap: "Market Cap"
    };

    const rowsOpts = rowsData?.getRows?.map((r: string) => {
        const rSplit = r.split(".");

        if (rSplit.length === 2) {
            return ({
                value: r,
                title: rSplit[1],
                type: (tableMap as any)[rSplit[0]]
            })
        } else {
            return null;
        }
    });

    const ratioCollectionOpts = pickedCollections?.reduce((acc, curr) => [
        ...acc,
        ...curr.calcs.map((c: any) => ({
            value: `${curr.id}/${encodeURIComponent(c.title)}`,
            title: `${curr.name}: ${c.title}`,
            type: 'Ratios'
        }))
    ], []);

    const allOpts = [
        ...ratioCollectionOpts || [],
        ...rowsOpts || [],
    ].filter(o => o);

    const pickedRow =
        allOpts?.length ?
            [allOpts.find(
                o =>
                    o?.value === row ||
                    o?.value === `${collectionId}/${encodeURIComponent(decodeURIComponent(row))}`
            )] : [];

    // console.log({
    //     row, collectionId,
    //     decodedRow: decodeURIComponent(row),
    //     encodedRow: encodeURIComponent(row),
    //     pickedRow
    // })

    // console.log({
    //     pickedRow,
    //     allOpts
    // })

    return (
        allOpts?.length && (<>
            <Box width={465}>
                <Autocomplete
                    multiple
                    autoComplete
                    autoHighlight
                    // autoSelect
                    limitTags={2}
                    disableListWrap
                    options={allOpts}
                    getOptionLabel={option => option ? option?.title : ''}
                    value={pickedRow}
                    // inputValue={v}
                    // onInputChange={(_, newInputValue) => {
                    //     console.log({
                    //         newInputValue
                    //     });
                    // }}
                    // defaultValue={v}
                    groupBy={option => `${option?.type}`}
                    // forcePopupIcon={false}
                    onChange={(event, newInputValue) => {
                        // console.log({ newInputValue });
                        history.push({
                            pathname: `/ranking/${newInputValue[1].value}`,
                            search: getNewSearchParamsString({})
                        });
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            variant="outlined"
                            label={`Selected Row`}
                            placeholder=""
                            style={{ minWidth: '0 !important' }}
                        />
                    )}
                    renderTags={(value: any[], getTagProps) =>
                        value && value.map((option: any, index: number) => {
                            return (
                                <Chip
                                    label={`${option?.type}: ${option?.title}`}
                                    {...getTagProps({ index })}
                                    className={`${option?.type}`}
                                    onDelete={undefined}
                                    onClick={(getTagProps({ index }) as any).onDelete}
                                />
                            )
                        })
                    }
                />
            </Box>
        </>)
    );
}

