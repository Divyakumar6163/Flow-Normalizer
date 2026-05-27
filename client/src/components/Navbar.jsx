import { FaLeaf } from "react-icons/fa";
import { HiOutlineMenuAlt3 } from "react-icons/hi";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg">
            <FaLeaf className="text-white text-lg" />
          </div>

          <div>
            <h1 className="font-bold text-xl text-slate-900">Breathe ESG</h1>
            <p className="text-xs text-slate-500">
              Carbon Data Review Platform
            </p>
          </div>
        </div>

        <button className="md:hidden text-3xl">
          <HiOutlineMenuAlt3 />
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button className="text-slate-600 hover:text-black transition">
            Dashboard
          </button>

          <button className="text-slate-600 hover:text-black transition">
            Uploads
          </button>

          <button
            className="
              bg-black
              text-white
              px-5
              py-2
              rounded-full
              hover:scale-105
              transition
            "
          >
            Analyst View
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
