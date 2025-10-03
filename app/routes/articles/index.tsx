import type { Route } from "../+types";
import { useLoaderData, useNavigate } from "react-router";
import { prisma } from "~/config/db.server";
import { File, Eye, ListTree } from "lucide-react";
import { type IndexLoaderData } from "~/types/article";
import { Button } from "~/components/ui/Button";
import { getServerClient } from "~/config/supabase.server";
import { Link, Form, useNavigation } from "react-router";
import { X, FileText } from "lucide-react";
import { type HeaderProps } from "~/types/article";

export async function loader({ request }: Route.LoaderArgs): Promise<IndexLoaderData> {
  const { supabase } = getServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (userResponse.error || !userResponse.data.user) {
    return { user: null, articles: [] };
  }

  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { children: true } },
    },
  });

  return { articles, user: userResponse.data.user };
}

function AuthHeader({ title, isSidebarOpen, onToggleSidebar, onCancel }: HeaderProps) {
  const navigation = useNavigation();
  const isLoggingOut =
    navigation.state === "submitting" && navigation.formData?.get("intent") === "logout";

  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-neutral-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </button>
            <h1 className="sm:text-lg hidden sm:block font-semibold text-neutral-900 cursor-pointer">
              {title}
            </h1>
          </div>
          <div className="flex items-center sm:gap-5 gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Form method="post" action="/logout">
              <input type="hidden" name="intent" value="logout" />
              <Button type="submit" variant="primary" isLoading={isLoggingOut}>
                Logout
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Articles() {
  const { articles, user } = useLoaderData<IndexLoaderData>();
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      {!user ? (
        <header className="w-full border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link to="/">
              <h1 className="text-xl font-bold text-gray-900 cursor-pointer">CMS App</h1>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/signup")}>Sign Up</Button>
            </div>
          </div>
        </header>
      ) : (
        <AuthHeader
          title="CMS App"
          isSidebarOpen={false}
          onToggleSidebar={() => {}}
          onCancel={() => navigate("/")}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and view all your articles
            </p>
          </div>
          <div className="flex flex-col items-end">
            {user ? (
              <Button
                icon={<ListTree className="w-4 h-4" />}
                onClick={() => navigate("/articles/tree")}
              >
                Tree View
              </Button>
            ) : (
              <Button
                icon={<ListTree className="w-4 h-4" />}
                variant="secondary"
                disabled
                title="Login required to access tree view"
              >
                Tree View (Login Required)
              </Button>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 hidden lg:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sub Articles
                  </th>
                  <th className="px-6 py-3 hidden xl:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 hidden xl:table-cell text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {articles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <File className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="font-medium">No articles found</p>
                        <p className="text-gray-400 mt-1">
                          Get started by creating your first article
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => (
                    <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                          {article.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-mono max-w-xs truncate">
                          {article.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {article._count.children}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.createdAt)}
                      </td>
                      <td className="px-6 py-4 hidden xl:table-cell whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/articles/${article.slug}`)}
                            className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {articles.length > 0 && (
          <div className="mt-4 flex items-center justify-between px-2">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">{articles.length}</span> article
              {articles.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}