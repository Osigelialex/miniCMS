import { Form, useLoaderData, useNavigate, useActionData, useNavigation, redirect } from "react-router";
import { prisma } from "~/config/db.server";
import { getServerClient } from "~/config/supabase.server";
import { Edit, Trash2, ArrowLeft, Calendar } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { ConfirmDialog } from "~/components/ui/ConfirmationDialog";
import { useEffect, useState } from "react";
import { type ViewLoaderData, type LoaderArgs } from "~/types/article";
import { toast } from "sonner";

export async function loader({ request, params }: LoaderArgs) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!article) {
    throw redirect("/articles");
  }

  return { article };
}

export async function action({ request, params }: LoaderArgs) {
  const { supabase } = getServerClient(request);
  const userResponse = await supabase.auth.getUser();

  if (userResponse.error || !userResponse.data.user) {
    throw redirect("/login");
  }

  try {
    await prisma.article.delete({
      where: { slug: params.slug },
    });
    return redirect("/articles");
  } catch (error) {
    return { error: "Failed to delete article" };
  }
}

export default function ViewArticle() {
  const { article } = useLoaderData<ViewLoaderData>();
  const navigate = useNavigate();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();
  const isDeleting = navigation.state === "submitting" && navigation.formData?.get("intent") === "delete";
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
      setIsDialogOpen(false);
    }
  }, [actionData]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteClick = () => {
    setIsDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/articles")}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Articles
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-neutral-900 mb-4">
              <div dangerouslySetInnerHTML={{ __html: article.title }} />
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {formatDate(article.createdAt)}</span>
              </div>
              {article.createdAt !== article.updatedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Updated {formatDate(article.updatedAt)}</span>
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-neutral max-w-none">
            <div className="whitespace-pre-wrap text-neutral-700 leading-relaxed">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>
          </div>
        </article>
      </main>

      <Form method="post" hidden>
        <input type="hidden" name="intent" value="delete" />
        <button type="submit" hidden />
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
    </div>
  );
}