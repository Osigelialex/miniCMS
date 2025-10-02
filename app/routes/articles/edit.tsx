import { useState, useEffect } from "react";
import { Form, useLoaderData, useActionData, useNavigation, useNavigate, redirect } from "react-router";
import { prisma } from "~/config/db.server";
import { getServerClient } from "~/config/supabase.server";
import { Save, Trash2 } from "lucide-react";
import { Input } from "~/components/ui/Input";
import { Textarea } from "~/components/ui/Textarea";
import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import { ArticleTree } from "~/components/ArticleTree/ArticleTree";
import { Sidebar } from "~/components/Layout/Sidebar";
import { Header } from "~/components/Layout/Header";
import { ConfirmDialog } from "~/components/ui/ConfirmationDialog";
import { toast } from "sonner";
import { type ActionArgs, type ArticleNode, type LoaderData } from "~/types/article";

export async function loader({ request, params }: ActionArgs) {
  const { supabase } = getServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (userResponse.error || !userResponse.data.user) {
    throw redirect("/login");
  }

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      parentId: true,
    },
  });

  if (!article) {
    throw new Response("Article not found", { status: 404 });
  }

  const allArticles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      parentId: true,
    },
  });

  const articleMap = new Map<string, ArticleNode>(allArticles.map((a) => [a.id, { ...a, children: [] }]));
  const tree: ArticleNode[] = [];
  for (const art of allArticles) {
    if (!art.parentId) {
      tree.push(articleMap.get(art.id)!);
    } else {
      const parent = articleMap.get(art.parentId);
      if (parent) {
        parent.children.push(articleMap.get(art.id)!);
      }
    }
  }

  return { article, articles: tree };
}

export async function action({ request, params }: ActionArgs) {
  const { supabase } = getServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (userResponse.error || !userResponse.data.user) {
    throw redirect("/login");
  }

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article) {
    throw redirect("/articles");
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    await prisma.article.delete({
      where: { id: article.id },
    });
    return new Response(null, {
      status: 302,
      headers: { Location: "/articles" },
    });
  }

  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!title || !slug || !content) {
    return { error: "Title, slug, and content are required" };
  }

  await prisma.article.update({
    where: { id: article.id },
    data: {
      title,
      slug,
      content,
      parentId: parentId || null,
    },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: `/articles/${slug}` },
  });
}

const flattenArticles = (nodes: ArticleNode[], excludeId: string, depth = 0): Array<ArticleNode & { depth: number }> => {
  return nodes.flatMap(node => {
    if (node.id === excludeId) return [];
    return [
      { ...node, depth },
      ...flattenArticles(node.children, excludeId, depth + 1)
    ];
  });
};

export default function EditArticle() {
  const { article, articles } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isDeleting = navigation.state === "submitting" && navigation.formData?.get("intent") === "delete";
  const actionData = useActionData<{ error?: string }>();

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
      setIsDialogOpen(false);
    }
  }, [actionData]);

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
  };

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

  const handleNavigate = (slug: string) => {
    navigate(`/articles/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Edit Article"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onCancel={() => navigate(`/articles/${article.slug}`)}
      />

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen}>
          <ArticleTree
            articles={articles}
            openNodes={openNodes}
            onToggleNode={toggleNode}
            onNavigate={handleNavigate}
          />
        </Sidebar>

        {isSidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-10 top-[73px]"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl">
          <Form method="post" className="space-y-6">
            <Input
              label="Title"
              name="title"
              id="title"
              defaultValue={article.title}
              placeholder="Enter article title"
              required
            />

            <Input
              label="Slug"
              name="slug"
              id="slug"
              defaultValue={article.slug}
              placeholder="article-url-slug"
              className="font-mono"
              helperText="URL-friendly version of the title"
              required
            />

            <Select
              label="Parent Category"
              name="parentId"
              id="parentId"
              defaultValue={article.parentId || ""}
              helperText="Organize your article under a parent category"
            >
              <option value="">None (Top Level)</option>
              {flattenArticles(articles, article.id).map((art) => (
                <option key={art.id} value={art.id}>
                  {"  ".repeat(art.depth)}
                  {art.depth > 0 ? "↳ " : ""}
                  {art.title}
                </option>
              ))}
            </Select>

            <Textarea
              label="Content"
              name="content"
              id="content"
              rows={16}
              className="font-mono"
              defaultValue={article.content}
              placeholder="Write your article content in markdown or plain text..."
              helperText="Supports Markdown formatting"
              required
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-neutral-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDialogOpen(true)}
                icon={<Trash2 className="w-4 h-4" />}
                className="flex-1 sm:flex-none text-red-600 border-red-300 hover:bg-red-50"
              >
                Delete
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(`/articles/${article.slug}`)}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                name="intent"
                value="update"
                isLoading={navigation.state === "submitting" && navigation.formData?.get("intent") === "update"}
                icon={<Save className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                Save Changes
              </Button>
            </div>
          </Form>

          <ConfirmDialog
            isOpen={isDialogOpen}
            title="Delete Article"
            description={`Are you sure you want to delete "${article.title}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            onConfirm={() => {
              const form = document.querySelector('form[method="post"]') as HTMLFormElement;
              form.submit();
            }}
            onCancel={handleCancelDelete}
            isLoading={isDeleting}
            variant="danger"
          />
        </main>
      </div>
    </div>
  );
}