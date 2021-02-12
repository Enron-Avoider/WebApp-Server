const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);

// Paste me in console to understand:
//
// const add = (str, str2) => `${str}${str2}`;
// pipe(
//   (a) => add(a, "1"),
//   (a) => add(a, "2"),
//   (a) => add(a, "3")
// )(">"); // result: ">123"
//

module.exports = pipe;
