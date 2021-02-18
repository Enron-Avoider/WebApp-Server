import { GET_CALCULATIONS } from "./calculations.queries";

export const calculationsResolvers = {
    Mutation: {
        addCalculation: (_: any, calculation: any, { cache }: any) => {
            const { calculations } = cache.readQuery({ query: GET_CALCULATIONS });
            const new_calculation = {
                ...calculation,
                scope: {
                    a: calculation.scope.a || null,
                    b: calculation.scope.b || null,
                    c: calculation.scope.c || null,
                    d: calculation.scope.d || null,
                    e: calculation.scope.e || null,
                    f: calculation.scope.f || null,
                    g: calculation.scope.g || null,
                    h: calculation.scope.h || null,
                    __typename: "scope"
                },
                __typename: "calculation"
            };

            console.log({
                calculations,
                new_calculation
            });

            cache.writeData({
                data: {
                    calculations: [...calculations, new_calculation]
                }
            });
            return new_calculation;
        },
        removeCalculation: (_: any, calculation: any, { cache }: any) => {
            const { calculations } = cache.readQuery({ query: GET_CALCULATIONS });
            cache.writeData({
                data: {
                    calculations: [...calculations.filter((c: any) => c.title !== calculation.title)]
                }
            });
            return true;
        },
        saveCalculation: (_: any, calculation: any, { cache }: any) => {
            const new_calculation = {
                ...calculation,
                title: calculation.newTitle,
                scope: {
                    a: calculation.scope.a || null,
                    b: calculation.scope.b || null,
                    c: calculation.scope.c || null,
                    d: calculation.scope.d || null,
                    e: calculation.scope.e || null,
                    f: calculation.scope.f || null,
                    g: calculation.scope.g || null,
                    h: calculation.scope.h || null,
                    __typename: "scope"
                },
                __typename: "calculation"
            };
            const { calculations } = cache.readQuery({ query: GET_CALCULATIONS });
            cache.writeData({
                data: {
                    calculations: [...calculations.map((c: any) =>
                        c.title === calculation.title ?
                            new_calculation : c
                    )]
                }
            });
            return new_calculation;
        }
    }
};