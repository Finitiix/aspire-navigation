
import { Link } from "react-router-dom";

export const Navigation = () => {
  return (
    <nav className="bg-primary w-full py-4 px-6 fixed top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
          Achievement Hub
        </Link>
      </div>
    </nav>
  );
};
