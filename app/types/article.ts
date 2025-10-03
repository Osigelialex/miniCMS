export interface ArticleNode {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  children: ArticleNode[];
}

export interface LoaderData {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    parentId: string | null;
  };
  articles: ArticleNode[];
}

export interface CreateArticleLoaderData {
  articles: ArticleNode[];
}

export interface IndexLoaderData {
  user: any,
  articles: Array<{
    id: string;
    title: string;
    slug: string;
    content: string;
    parentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: { children: number };
  }>;
}

export type ActionArgs = {
  request: Request;
  params: {
    slug: string;
  };
};

export type LoaderArgs = {
  request: Request;
  params: {
    slug: string;
  };
};

export interface ViewLoaderData {
  article: {
    id: string;
    title: string;
    slug: string;
    content: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
  };
}

export interface HeaderProps {
  title: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCancel: () => void;
}
