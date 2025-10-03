import { Link } from "react-router";
import { Button } from "~/components/ui/Button";
import { useNavigate } from "react-router";

export default function Index() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-white text-black flex flex-col">
      <header className="w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">CMS App</h1>
          <nav className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:underline">
              Login
            </Link>
            <Link to="/signup" className="text-sm font-medium hover:underline">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Manage Your Articles With Ease
        </h2>
        <p className="text-gray-600 max-w-xl mb-8">
          A simple, modern CMS where you can create, organize, and manage your
          content. Built with speed and clarity in mind.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={() => navigate("/signup")}>
            Get Started
          </Button>
          <Button variant="ghost" onClick={() => navigate("/articles")}>
            View Articles
          </Button>
        </div>
      </section>

      <footer className="w-full border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} CMS App. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
