import {
  Home,
  Book,
  FolderKanban,
  Settings,
  History,
  Users,
} from "lucide-react";

export const Sidebar = () => {
  return (
    <aside className="w-[60px] bg-[#161b22] text-white flex flex-col items-center py-4 space-y-6">
      {/* Rounded App Icon */}
      <div className="w-10 h-10 bg-white rounded-xl" />{" "}
      {/* aici e magia: rounded-xl */}
      {/* Icons */}
      <nav className="flex flex-col gap-6 mt-6">
        <Home size={20} />
        <Book size={20} />
        <FolderKanban size={20} />
        <History size={20} />
        <Settings size={20} />
        <Users size={20} />
      </nav>
    </aside>
  );
};

