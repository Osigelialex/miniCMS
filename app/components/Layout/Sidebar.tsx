import { Plus } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
}

export function Sidebar({ isOpen, children }: SidebarProps) {
  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-full sm:w-72 bg-white border-r border-neutral-200 transition-transform duration-300 ease-in-out z-20 overflow-y-auto`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
            Article Tree
          </h2>
          <button
            className="p-1 rounded-md hover:bg-neutral-100 transition-colors"
            title="Add new category"
          >
            <Plus className="w-4 h-4 text-neutral-600" />
          </button>
        </div>
        {children}
      </div>
    </aside>
  );
}