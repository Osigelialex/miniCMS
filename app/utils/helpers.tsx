import { type ArticleNode } from "~/components/ArticleTree/TreeNode";

export const flattenArticles = (nodes: ArticleNode[], depth = 0): Array<ArticleNode & { depth: number }> => {
  return nodes.flatMap(node => [
    { ...node, depth },
    ...flattenArticles(node.children, depth + 1)
  ]);
};