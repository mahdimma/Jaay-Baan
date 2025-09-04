import React from "react";
import { useAuthStore } from "../../store";
import { useLogout } from "../../hooks/useApi";
import { Icon, Button } from "../ui";
import Breadcrumb from "./Breadcrumb";

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200 shadow-sm">
      <div className="flex items-center">
        {/* Mobile toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="mr-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 lg:hidden transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon
            name={isSidebarOpen ? "x" : "align-justify"}
            size={20}
            className="text-gray-700 dark:text-gray-300"
          />
        </Button>

        {/* Desktop toggle button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="mr-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hidden lg:flex transition-colors"
          aria-label="Toggle sidebar"
        >
          <Icon
            name={isSidebarOpen ? "panel-left-close" : "panel-left-open"}
            size={20}
            className="text-gray-700 dark:text-gray-300"
          />
        </Button>

        <Breadcrumb />
      </div>

      <div className="flex items-center">
        <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon name="user" size={14} className="text-blue-600" />
          </div>
          <span className="text-sm font-medium text-gray-800 mr-1">
            {user?.username}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          loading={logoutMutation.isPending}
          className="bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 shadow-sm mr-2"
        >
          <Icon name="logout" size={16} className="ml-1" />
          خروج
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
