import { LoopInfo, ParamInfo } from "../entity/ClazzInfo";
import { AstNode, NodeTypes } from "@j2a/core/dist/index";
import { traverser } from "@j2a/core/dist/index";
import { compiler } from "@j2a/core/dist/index";

const FirstUpperCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

function parseLiteral(type?: NodeTypes) {
  return type
    ? {
        [NodeTypes.NullLiteral]: "any",
        [NodeTypes.BooleanLiteral]: "boolean",
        [NodeTypes.StringLiteral]: "string",
        [NodeTypes.NumericLiteral]: "number",
        [NodeTypes.Daddy]: "",
        [NodeTypes.ObjectProperty]: "",
        [NodeTypes.AssignmentExpression]: "",
        [NodeTypes.SplitExpression]: "",
        [NodeTypes.ObjectExpression]: "",
        [NodeTypes.ArrayExpression]: "",
      }[type]
    : "";
}

export function json2ts({
  result = "",
  ast,
}: {
  result?: string;
  ast?: AstNode;
}): {
  loop: LoopInfo[];
  params: ParamInfo[];
} {
  let newAst: AstNode = ast ? ast : compiler(result);
  let loop: LoopInfo[] = [];
  let params: ParamInfo[] = [];

  function pushParams({ type, key, comment }: ParamInfo) {
    params.push({
      type,
      key,
      comment: comment ? comment : !key ? "⚠️⚠️⚠️ name it" : "",
    });
  }
  traverser({
    ast: newAst,
    deep: false,
    visitor: {
      [NodeTypes.ObjectProperty]: {
        enter(node: AstNode) {
          let nodeValue: AstNode | undefined = node.params?.[0];
          let key = node.identifier || "";
          let clazz = FirstUpperCase(key);
          const typeName = parseLiteral(nodeValue?.type);
          switch (nodeValue?.type) {
            case NodeTypes.BooleanLiteral:
              pushParams({
                type: typeName,
                key,
              });
              break;
            case NodeTypes.NumericLiteral:
              let type = typeName;
              let value = nodeValue?.value ?? "0";
              if (value.includes(".")) {
                type = typeName;
              } else if (value?.length >= 10) {
                type = typeName;
              }
              pushParams({
                type,
                key,
              });
              break;
            case NodeTypes.ObjectExpression:
              pushParams({
                type: clazz,
                key,
              });
              loop.push({
                node: nodeValue,
                clazz: clazz,
              });
              break;
            case NodeTypes.ArrayExpression:
              const node = nodeValue?.params?.[0];
              if (node?.type === NodeTypes.ObjectExpression) {
                pushParams({
                  type: `${clazz}[]`,
                  key,
                });
                loop.push({
                  node: node,
                  clazz: clazz,
                });
              } else {
                pushParams({
                  type: `${parseLiteral(node?.type)}[]`,
                  key,
                });
              }
              break;
            case NodeTypes.StringLiteral:
              pushParams({
                type: typeName,
                key,
              });
              break;
            case NodeTypes.NullLiteral:
            default:
              pushParams({
                type: typeName,
                key,
                comment: "⚠️⚠️⚠️ contact ur backend developer plz",
              });
              break;
          }
        },
      },
    },
  });
  return { params, loop };
}
