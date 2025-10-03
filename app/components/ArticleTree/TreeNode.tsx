import { ChevronDown, ChevronRight, FileText, FolderOpen, Folder } from "lucide-react";

export interface ArticleNode {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  children: ArticleNode[];
}

interface TreeNodeProps {
  node: ArticleNode;
  depth: number;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onNavigate: (slug: string) => void;
}

export function TreeNode({ node, depth, isOpen, onToggle, onNavigate }: TreeNodeProps) {
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer group`}
        style={{ paddingLeft: depth > 0 ? `${depth * 1.5}rem` : undefined }}
      >
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="text-neutral-500 hover:text-neutral-900 transition-colors"
            aria-label={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        <button onClick={() => onNavigate(node.slug)} className="flex cursor-pointer items-center gap-2 flex-1 min-w-0">
          {hasChildren ? (
            isOpen ? (
              <FolderOpen className="w-4 h-4 text-neutral-600 flex-shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-neutral-600 flex-shrink-0" />
            )
          ) : (
            <FileText className="w-4 h-4 text-neutral-500 flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-neutral-700 truncate group-hover:text-neutral-900">
            {node.title}
          </span>
        </button>
      </div>
      {hasChildren && isOpen && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isOpen={isOpen}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}