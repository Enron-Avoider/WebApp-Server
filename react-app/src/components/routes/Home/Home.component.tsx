import React, { FunctionComponent } from 'react';

import './style.sass';

export const Home: FunctionComponent<{}> = ({ }) => {
    return (
        <>
            <p>
                Enron Avoider contains a set of tools built
                for learning value investing.
            </p>
            <p>
                The tools will expand based on value investing
                questions for which we can't find good enough solutions to elsewhere.
            </p>
            <p>
                Ratios and Checks will soon be community generated and managed.
                More tools will be community generated.
            </p>
            <p>
                I'd love to help empower the open source Value Investing community
                towards sharing, acquiring and simplifying wisdom.
            </p>
        </>
    );
}

