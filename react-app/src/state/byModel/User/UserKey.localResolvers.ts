import { gql } from "@apollo/client";
// import RandomID from "random-id";
import { GET_USER_KEYS } from "./UserKey.localQueries";
import { ADD_USER_KEY } from "./UserKey.localQueries"

export const userKeysResolvers = {
    Mutation: {
        addUserKey: (_: any, userKey: any, { cache }: any) => {


            console.log({ userKey });

            // const { userKeys } = cache.readQuery({ query: GET_USER_KEYS });
            let new_userKey = {
                id: userKey.id,
                __typename: "userKey"
            };
            cache.writeQuery({
                query: gql`{
                    userKeys {
                        id
                    }
                }`,
                data: {
                    userKeys: [/*...userKeys,*/ new_userKey] // replaces last key with new
                }
            });


            // cache.updateQuery({ query: ADD_USER_KEY }, (data: any) => ({
            //     userKeys: [/*...userKeys,*/ new_userKey]
            // }));
            console.log("UserKeys: ", cache.readQuery({ query: GET_USER_KEYS }));
            return new_userKey;
        }
    }
};