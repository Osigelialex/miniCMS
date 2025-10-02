import { FileText } from "lucide-react";
import { type ArticleNode } from "./TreeNode";
import { TreeNode } from "./TreeNode";

export interface ArticleTreeProps {
  articles: ArticleNode[];
  openNodes: Set<string>;
  onToggleNode: (id: string) => void;
  onNavigate: (slug: string) => void;
}

export function ArticleTree({ articles, openNodes, onToggleNode, onNavigate }: ArticleTreeProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <p className="text-sm text-neutral-500">No articles yet</p>
        <p className="text-xs text-neutral-400 mt-1">Create your first article</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {articles.map((article) => (
        <TreeNode
          key={article.id}
          node={article}
          depth={0}
          isOpen={openNodes.has(article.id)}
          onToggle={onToggleNode}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}