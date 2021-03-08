export const stringifyWithoutQuotesOnKeys = (obj: any) => {
    const cleaned = JSON.stringify(obj, null, 2);

    return cleaned.replace(/^[\t ]*"[^:\n\r]+(?<!\\)":/gm, (match) => {
        return match.replace(/"/g, "");
    })
    .replace(/\n+/g, '');
}