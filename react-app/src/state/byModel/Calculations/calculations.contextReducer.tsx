import React, { createContext, useReducer, FunctionComponent } from 'react';

const initialState: any = {
    hi: 0,
    ratioWindows:[{
        id: '',
        name: 'basic',
        isOwnedByPlatform: true,
        isOwnedByUser: false,
        about: "",
        calcs: [{
            title: "market cap",
            about: "",
            calc: "a*b",
            scope: {
                a: "price.price",
                b: "aggregatedShares.outstandingShares"
            }
        }]
    }]
};
const calculationsStore = createContext(initialState);

const CalculationsProvider: FunctionComponent = ({ children }) => {

    console.log("CalculationsProvider render");

    const [state, dispatch] = useReducer((state: any, action: any) => {
        switch (action.type) {

            case 'hii': {
                //   const newState = '';// do something with the action
                return { ...state, hi: state.hi + 1 };
            }
            default:
                throw new Error();
        };
    }, initialState);

    return <calculationsStore.Provider
        value={{ state, dispatch }}
    >{children}</calculationsStore.Provider>;
};

export { calculationsStore, CalculationsProvider }