import { Form, Link, useNavigation } from "react-router";
import { X, FileText } from "lucide-react";
import { Button } from "../ui/Button";

interface HeaderProps {
  title: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onCancel: () => void;
}

export function Header({ title, isSidebarOpen, onToggleSidebar, onCancel }: HeaderProps) {
  const navigation = useNavigation();
  const isLoggingOut = navigation.state === "submitting" && navigation.formData?.get("intent") === "logout";

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
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
            >
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