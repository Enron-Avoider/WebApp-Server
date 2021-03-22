// import RandomID from "random-id";
import { GET_USER_KEYS } from "./UserKey.localQueries";

export const userKeysResolvers = {
    Mutation: {
        addUserKey: (_: any, userKey: any, { cache }: any) => {
            const { userKeys } = cache.readQuery({ query: GET_USER_KEYS });
            let new_userKey = {
                id: userKey.id,
                __typename: "userKey"
            };
            cache.writeData({
                data: {
                    userKeys: [/*...userKeys,*/ new_userKey] // replaces last key with new
                }
            });
            console.log("UserKeys: ", cache.readQuery({ query: GET_USER_KEYS }));
            return new_userKey;
        }
    }
};