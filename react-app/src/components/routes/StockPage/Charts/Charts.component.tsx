import React, { useState, FunctionComponent } from 'react';
import {
    Paper,
    Grid,
    Box,
    Typography,
    Avatar,
    IconButton,
    ClickAwayListener,
    MenuList,
    Button,
    Card,
    CardContent,
    SvgIcon
} from '@material-ui/core';
import { Equalizer, FilterList } from '@material-ui/icons';
import { Chart } from 'react-charts';
import numeral from 'numeral';

import './style.sass';

export const Charts: FunctionComponent<{
    yearlyFinancials: any,
    calculations: any,
    showPercentage?: any,
    toggleShowPercentage?: any
}> = ({
    yearlyFinancials,
    calculations,
    showPercentage,
    toggleShowPercentage
}) => {

        const axes = React.useMemo(
            () => [
                { primary: true, type: 'ordinal', position: 'bottom', show: false },
                { type: 'linear', position: 'left', show: false },
            ],
            []
        )

        console.log({
            yearlyFinancials,
            calculations
        });

        return (
            <>
                <Box p={2} pb={6} mt={2} position="relative">
                    <Box
                        mt={-1}
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        height="250px"
                        paddingTop="50px"
                    >
                        <Box flex={1} height="100%">
                            <Typography variant="h5">
                                Price
                            </Typography>
                            <Chart
                                data={[
                                    {
                                        label: 'Price',
                                        data: yearlyFinancials.years
                                            .map((y: any) => ([y, yearlyFinancials.price[0][y]])),
                                    },
                                ]

                                }
                                axes={axes}
                                tooltip
                                dark

                            // primaryCursor={primaryCursor}
                            // secondaryCursor={secondaryCursor}
                            />
                        </Box>

                        <Box flex={1} marginX={4} height="100%">
                            <Typography variant="h5">
                                Income & Loss
                            </Typography>
                            <Chart
                                data={React.useMemo(
                                    () => Object.entries(yearlyFinancials.pl).map(([k, row]: any) => ({
                                        label: row.title,
                                        data: yearlyFinancials.years
                                            .map((y: any) => ([y, row[y] || 0])),
                                    })),
                                    [yearlyFinancials]
                                )}
                                axes={axes}
                                tooltip
                                dark

                                primaryCursor
                            />
                        </Box>

                        <Box flex={1} height="100%">
                            <Typography variant="h5">
                                Balance Sheet
                            </Typography>
                            <Chart
                                data={React.useMemo(
                                    () => Object.entries(yearlyFinancials.bs).map(([k, row]: any) => ({
                                        label: row.title,
                                        data: yearlyFinancials.years
                                            .map((y: any) => ([y, row[y] || 0])),
                                    })),
                                    [yearlyFinancials]
                                )}
                                axes={axes}
                                tooltip
                                dark

                                primaryCursor
                            // secondaryCursor
                            />
                        </Box>
                    </Box>

                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        height="250px"
                        paddingTop="50px"
                    >
                        <Box flex={1} height="100%">
                            <Typography variant="h5">
                                Cash Flow
                            </Typography>
                            <Chart
                                data={React.useMemo(
                                    () => Object.entries(yearlyFinancials.cf).map(([k, row]: any) => ({
                                        label: row.title,
                                        data: yearlyFinancials.years
                                            .map((y: any) => ([y, row[y] || 0])),
                                    })),
                                    [yearlyFinancials]
                                )}
                                axes={axes}
                                tooltip
                                dark

                                primaryCursor
                            // secondaryCursor
                            />
                        </Box>
                        <Box flex={1} marginX={4} height="100%">
                            <Typography variant="h5">
                                Aggregated Shares
                            </Typography>
                            <Box height="100%">
                                <Chart
                                    data={React.useMemo(
                                        () => Object.entries(yearlyFinancials.aggregatedShares).map(([k, row]: any) => ({
                                            label: row.title,
                                            data: yearlyFinancials.years
                                                .map((y: any) => ([y, row[y] || 0])),
                                        })),
                                        [yearlyFinancials]
                                    )}
                                    axes={axes}
                                    tooltip
                                    dark

                                    primaryCursor
                                />
                            </Box>
                        </Box>
                        <Box flex={1} height="100%">
                            <Typography variant="h5">
                                Ratios
                            </Typography>
                            <Chart
                                data={React.useMemo(
                                    () => Object.entries(calculations).map(([k, row]: any) => ({
                                        label: row.title,
                                        data: yearlyFinancials.years
                                            .map((y: any) => ([y, numeral(row[y] || 0).value()])),
                                    })),
                                    [yearlyFinancials]
                                )}
                                axes={axes}
                                tooltip
                                dark

                                primaryCursor
                            />
                        </Box>
                    </Box>

                    <Box position="absolute" top="5px" right="5px">
                        {/* <IconButton color="primary" onClick={() => setShowGraph(!showGraph)}>
                            <FilterList />
                        </IconButton> */}

                        {/* <IconButton color="primary" onClick={() => setShowGraph(!showGraph)}>
                            <Equalizer />
                        </IconButton> */}

                        {/* <Box> */}
                        {/* <IconButton color={showPercentage ? 'secondary' : 'primary'} onClick={toggleShowPercentage}>
                                <SvgIcon viewBox="0 0 344 344">
                                    <path
                                        d="M 99.00,57.23
                                        C 81.98,61.14 68.86,69.77 61.32,86.00
                                            46.16,118.63 69.68,157.58 106.00,158.00
                                            114.15,158.09 122.63,156.87 130.00,153.19
                                            168.76,133.86 166.91,77.59 128.00,60.88
                                            121.65,58.15 114.86,57.01 108.00,57.23
                                            104.64,57.00 102.36,57.00 99.00,57.23 Z
                                        M 231.00,63.00
                                        C 231.00,63.00 134.58,198.00 134.58,198.00
                                            134.58,198.00 103.86,241.00 103.86,241.00
                                            103.86,241.00 88.00,265.00 88.00,265.00
                                            88.00,265.00 113.00,281.00 113.00,281.00
                                            113.00,281.00 209.42,146.00 209.42,146.00
                                            209.42,146.00 240.14,103.00 240.14,103.00
                                            240.14,103.00 256.00,79.00 256.00,79.00
                                            256.00,79.00 231.00,63.00 231.00,63.00 Z
                                        M 108.00,86.71
                                        C 114.86,87.22 120.15,89.25 124.36,95.02
                                            133.88,108.01 125.02,127.21 109.00,128.24
                                            88.32,129.57 78.43,102.78 95.02,90.64
                                            99.23,87.55 102.94,86.86 108.00,86.71 Z
                                        M 228.00,186.23
                                        C 210.98,190.14 197.86,198.77 190.32,215.00
                                            175.16,247.63 198.68,286.58 235.00,287.00
                                            243.15,287.09 251.63,285.87 259.00,282.19
                                            297.76,262.86 295.91,206.59 257.00,189.88
                                            250.65,187.15 243.86,186.01 237.00,186.23
                                            233.64,186.00 231.36,186.00 228.00,186.23 Z
                                        M 237.00,215.71
                                        C 243.86,216.22 249.15,218.25 253.36,224.02
                                            262.88,237.01 254.02,256.21 238.00,257.24
                                            217.32,258.57 207.43,231.78 224.02,219.64
                                            228.23,216.55 231.94,215.86 237.00,215.71 Z"
                                    />
                                </SvgIcon>
                            </IconButton> */}
                        {/* </Box> */}
                    </Box>

                    {/* {showGraph && (
                        <ClickAwayListener onClickAway={() => setShowGraph(!showGraph)}>
                            <Box position="absolute" zIndex="2" right="0" top="0">
                                TODO!
                             </Box>
                        </ClickAwayListener>
                    )} */}
                </Box>
            </>
        );
    }
