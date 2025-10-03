import { useState, useEffect } from "react";
import { Form, useLoaderData, useNavigation, useNavigate, redirect, useActionData } from "react-router";
import { prisma } from "~/config/db.server";
import { getServerClient } from "~/config/supabase.server";
import { Save, Trash2, Edit3, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Route } from "../+types";
import { Input } from "~/components/ui/Input";
import { RichTextEditor } from "~/components/ui/RichTextEditor";
import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import { ArticleTree } from "~/components/ArticleTree/ArticleTree";
import { Sidebar } from "~/components/Layout/Sidebar";
import { Header } from "~/components/Layout/Header";
import { ConfirmDialog } from "~/components/ui/ConfirmationDialog";
import { flattenArticles } from "~/utils/helpers";
import slugify from "slugify";
import type { ArticleNode, CreateArticleLoaderData } from "~/types/article";

interface FormData {
  title: string;
  slug: string;
  content: string;
  parentId: string;
}

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase } = getServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (userResponse.error || !userResponse.data.user) {
    throw redirect('/login');
  }

  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      parentId: true,
    },
  });

  const articleMap = new Map<string, ArticleNode>(articles.map((a) => [a.id, { ...a, children: [] }]));
  const tree: ArticleNode[] = [];
  for (const article of articles) {
    if (!article.parentId) {
      tree.push(articleMap.get(article.id)!);
    } else {
      const parent = articleMap.get(article.parentId);
      if (parent) {
        parent.children.push(articleMap.get(article.id)!);
      }
    }
  }

  return { articles: tree, allArticles: articles };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (userResponse.error || !userResponse.data.user) {
    throw redirect('/login');
  }

  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "create") {
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") as string | null;

    if (!title || !slug || !content) {
      return { error: "Title, slug, and content are required" };
    }

    const existingArticle = await prisma.article.findUnique({ where: { slug } });
    if (existingArticle) {
      return { error: "Slug already exists. Please choose a unique slug." };
    }

    try {
      await prisma.article.create({
        data: {
          title,
          slug,
          content,
          parentId: parentId || null,
        },
      });
      return redirect("/articles");
    } catch (error: any) {
      return { error: error.message || "Failed to create article" };
    }
  }

  if (intent === "update") {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const content = formData.get("content") as string;
    const parentId = formData.get("parentId") as string | null;

    if (!id || !title || !slug || !content) {
      return { error: "ID, title, slug, and content are required" };
    }

    const existingArticle = await prisma.article.findFirst({
      where: { slug, NOT: { id } },
    });
    if (existingArticle) {
      return { error: "Slug already exists. Please choose a unique slug." };
    }

    try {
      await prisma.article.update({
        where: { id },
        data: {
          title,
          slug,
          content,
          parentId: parentId || null,
        },
      });
      return redirect("/articles");
    } catch (error: any) {
      return { error: error.message || "Failed to update article" };
    }
  }

  if (intent === "delete") {
    const id = formData.get("id") as string;

    if (!id) {
      return { error: "Article ID is required" };
    }

    try {
      const article = await prisma.article.findUnique({ where: { id } });
      if (!article) {
        return { error: "Article not found" };
      }
      await prisma.article.delete({
        where: { id },
      });
      return redirect("/articles");
    } catch (error: any) {
      return { error: error.message || "Failed to delete article" };
    }
  }

  return { error: "Invalid intent" };
}

export default function NewArticle() {
  const { articles, allArticles } = useLoaderData<CreateArticleLoaderData & { allArticles: any[] }>();
  const actionData = useActionData<{ error?: string }>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    slug: "",
    content: "",
    parentId: "",
  });

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  const toggleNode = (id: string) => {
    setOpenNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "title" && !isEditMode) {
        return { ...prev, title: value, slug: slugify(value, { lower: true }) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleContentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, parentId: e.target.value }));
  };

  const handleTreeNodeClick = (slug: string) => {
    const article = allArticles.find((a) => a.slug === slug);
    if (article) {
      setSelectedArticleId(article.id);
      setIsEditMode(true);
      setFormData({
        title: article.title,
        slug: article.slug,
        content: article.content || "",
        parentId: article.parentId || "",
      });
    }
    setIsSidebarOpen(false);
  };

  const handleNewArticle = () => {
    setSelectedArticleId(null);
    setIsEditMode(false);
    setFormData({
      title: "",
      slug: "",
      content: "",
      parentId: "",
    });
    setIsSidebarOpen(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getHeaderTitle = () => {
    if (isEditMode) {
      return `Edit Article: ${formData.title}`;
    }
    return "Create New Article";
  };

  const isSubmitting = navigation.state === "submitting";
  const isDeleting = isSubmitting && navigation.formData?.get("intent") === "delete";

  return (
    <div className="min-h-screen bg-white">
      <Header
        title={getHeaderTitle()}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onCancel={() => navigate("/articles")}
      />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen}>
          <div className="mb-4 px-3">
            <Button
              type="button"
              variant="primary"
              onClick={handleNewArticle}
              icon={<Plus className="w-4 h-4" />}
              className="w-full"
              disabled={isSubmitting}
            >
              New Article
            </Button>
          </div>
          <ArticleTree
            articles={articles}
            openNodes={openNodes}
            onToggleNode={toggleNode}
            onNavigate={handleTreeNodeClick}
          />
        </Sidebar>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
          {isEditMode && (
            <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
              <Edit3 className="w-4 h-4" />
              Editing Mode
            </div>
          )}

          <Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value={isEditMode ? "update" : "create"} />
            {isEditMode && <input type="hidden" name="id" value={selectedArticleId || ""} />}

            <Input
              label="Title"
              name="title"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter article title"
              required
              disabled={isSubmitting}
            />

            <Input
              label="Slug"
              name="slug"
              id="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="article-url-slug"
              className="font-mono"
              helperText="URL-friendly version of the title"
              required
              disabled={isSubmitting}
            />

            <Select
              label="Parent Category"
              name="parentId"
              id="parentId"
              value={formData.parentId}
              onChange={handleParentChange}
              helperText="Organize your article under a parent category"
              disabled={isSubmitting}
            >
              <option value="">None (Top Level)</option>
              {flattenArticles(articles).map((article) => {
                if (article.id === selectedArticleId) return null;
                return (
                  <option key={article.id} value={article.id}>
                    {"  ".repeat(article.depth)}
                    {article.depth > 0 ? "↳ " : ""}
                    {article.title}
                  </option>
                );
              })}
            </Select>

            <RichTextEditor
              label="Content"
              name="content"
              id="content"
              value={formData.content}
              onChange={handleContentChange}
              className="min-h-[400px]"
              placeholder="Write your article content..."
              helperText="Use the toolbar to format your content"
              required
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-neutral-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/articles")}
                className="flex-1 sm:flex-none"
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              {isEditMode && (
                <Button
                  type="button"
                  onClick={handleDeleteClick}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="flex-1 sm:flex-none bg-red-500"
                  disabled={isSubmitting}
                >
                  Delete
                </Button>
              )}

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting && navigation.formData?.get("intent") !== "delete"}
                icon={isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                className="flex-1 sm:flex-none sm:ml-auto"
                disabled={isSubmitting}
              >
                {isEditMode ? "Update Article" : "Create Article"}
              </Button>
            </div>
          </Form>
        </main>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Article"
        description={`Are you sure you want to delete "${formData.title}"? This action cannot be undone and will permanently remove the article.`}
        confirmText="Delete Article"
        cancelText="Cancel"
        onConfirm={() => {}}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
}