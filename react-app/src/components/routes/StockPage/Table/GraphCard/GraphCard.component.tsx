import React from 'react';
import { Chart } from 'react-charts';

import {
    Typography,
    Card,
    CardActions,
    CardContent,
    Button,
    Box
} from '@material-ui/core';

import './style.sass';

export default function GraphCard(
    {
        years,
        data
    }: {
        years: number[],
        data: {}[]
    }
) {

    console.log({ years, data });

    const axes = React.useMemo(
        () => [
            { primary: true, type: 'ordinal', position: 'bottom', show: true },
            { type: 'linear', position: 'left', show: true },
        ],
        []
    )

    return (
        <Box width="calc(100% - 70px)" height="calc(100% - 50px)" p={4}>
            <Chart
                data={React.useMemo(
                    () => Object.entries(data).map(([k, row]: any) => ({
                        label: row.title,
                        data: years.map((y: any) => ([y, row[y] || 0])),
                    })),
                    [data]
                )}
                axes={axes}
                tooltip
                dark
            />
        </Box>
    );
}

