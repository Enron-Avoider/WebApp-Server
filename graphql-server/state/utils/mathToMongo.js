// https://codesandbox.io/s/gallant-bas-8fzzl?file=/src/index.js

const jsep = require("jsep");

const mathToMongo = (mathExpr, args) => {

  // console.log({
  //   mathExpr, args
  // });

  const exprString = mathExpr
    .split("")
    .map((l) => (RegExp(/[a-z]/).test(l) ? `_[${l.charCodeAt(0) - 97}]` : l))
    .reduce((p, c) => `${p}${c}`, "");

  // console.log({
  //   exprString
  // });

  //treat first parameter as array or convert variable list of parameters to array and ignore first element (expression)
  const argsList =
    typeof args == "object"
      ? args
      : Array.prototype.splice.call(arguments, 1, arguments.length - 1);

  const transformJsepExpression = (node, args) => {
    const operators = {
      "+": "$add",
      "-": "$subtract",
      "*": "$multiply",
      "/": "$divide",
    };

    switch (node.type) {
      case "BinaryExpression":
        const part = {};
        if (node.operator === "/") {
          part["$cond"] = [
            {
              $eq: [transformJsepExpression(node.right, args), 0],
            },
            0,
            {
              $divide: [
                transformJsepExpression(node.left, args),
                transformJsepExpression(node.right, args),
              ],
            },
          ];
        } else {
          part[operators[node.operator]] = [
            transformJsepExpression(node.left, args),
            transformJsepExpression(node.right, args),
          ];
        }
        return part;

      case "Literal":
        return node.value;

      case "Identifier":
        return "$" + node.name;

      case "UnaryExpression":
        if (node.operator == "-" && node.prefix) {
          //if(node.argument.type == "Literal"){
          //  we cannot simply return negative value since function result must be an object :(
          //  return -transformJsepExpression(node.argument);
          //}

          return {
            $multiply: [-1, transformJsepExpression(node.argument, args)],
          };
        } else if (node.operator == "+") {
          return transformJsepExpression(node.argument, args);
        }
      case "MemberExpression":
        if (
          node.object &&
          node.object.type == "Identifier" &&
          node.object.name == "_" &&
          args &&
          typeof node.property.value == "number" &&
          node.property.value < args.length
        ) {
          return args[node.property.value];
        }

      case "CallExpression":
        if (node.callee.name === "M") {
          return { $max: [0, transformJsepExpression(node.arguments[0], args)] };
        }

    }

    return "error";
  };

  return transformJsepExpression(jsep(exprString), argsList);
};

module.exports = mathToMongo;
