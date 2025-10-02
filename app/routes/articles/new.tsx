import { useState } from "react";
import { Form, useLoaderData, useNavigation, useNavigate, redirect } from "react-router";
import { prisma } from "~/config/db.server";
import { getServerClient } from "~/config/supabase.server";
import { Save } from "lucide-react";
import type { Route } from "../+types";
import { Input } from "~/components/ui/Input";
import { Textarea } from "~/components/ui/Textarea";
import { Select } from "~/components/ui/Select";
import { Button } from "~/components/ui/Button";
import { ArticleTree } from "~/components/ArticleTree/ArticleTree";
import { Sidebar } from "~/components/Layout/Sidebar";
import { Header } from "~/components/Layout/Header";
import { flattenArticles } from "~/utils/helpers";
import slugify from "slugify";

interface ArticleNode {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  children: ArticleNode[];
}

interface LoaderData {
  articles: ArticleNode[];
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
      parentId: true,
    },
  });

  const articleMap = new Map<String, ArticleNode>(articles.map((a) => [a.id, { ...a, children: [] }]));
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

  return { articles: tree };
}

export async function action({ request }: Route.ActionArgs) {
  const { supabase } = getServerClient(request);
  const userResponse = await supabase.auth.getUser();
  console.log(userResponse);

  if (userResponse.error || !userResponse.data.user) {
    throw redirect('/login');
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const content = formData.get("content") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!title || !slug || !content) {
    return { error: "Title, slug, and content are required" };
  }

  await prisma.article.create({
    data: {
      title,
      slug,
      content,
      parentId: parentId || null,
    },
  });

  return new Response(null, {
    status: 302,
    headers: { Location: "/articles" },
  });
}

export default function NewArticle() {
  const { articles } = useLoaderData<LoaderData>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
  });

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
      if (name === "title") {
        return { ...prev, title: value, slug: slugify(value, { lower: true }) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleNavigate = (slug: string) => {
    navigate(`/articles/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        title="Create New Article"
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onCancel={() => navigate("/articles")}
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
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter article title"
              required
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
            />

            <Select
              label="Parent Category"
              name="parentId"
              id="parentId"
              helperText="Organize your article under a parent category"
            >
              <option value="">None (Top Level)</option>
              {flattenArticles(articles).map((article) => (
                <option key={article.id} value={article.id}>
                  {"  ".repeat(article.depth)}
                  {article.depth > 0 ? "↳ " : ""}
                  {article.title}
                </option>
              ))}
            </Select>

            <Textarea
              label="Content"
              name="content"
              id="content"
              rows={16}
              className="font-mono"
              placeholder="Write your article content in markdown or plain text..."
              helperText="Supports Markdown formatting"
              required
            />

            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-neutral-200">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/articles")}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={navigation.state === "submitting"}
                icon={<Save className="w-4 h-4" />}
                className="flex-1 sm:flex-none"
              >
                Create Article
              </Button>
            </div>
          </Form>
        </main>
      </div>
    </div>
  );
}