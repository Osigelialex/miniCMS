import { LogOut, Bell } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CM</span>
              </div>
              <h1 className="text-lg sm:text-xl font-semibold hidden sm:block text-gray-900">
                CMS
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}