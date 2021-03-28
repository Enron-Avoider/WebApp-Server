export const stringifyWithoutQuotesOnKeys = (obj: any) => {
    const cleaned = JSON.stringify(obj, null, 2);

    const res = cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, (match) => {
        return match.replace(/"/g, "");
    })
        .replace(/\n+/g, '');

    console.log({ res });

    return res;
}