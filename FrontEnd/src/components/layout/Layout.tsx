import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Button, Icon } from "../ui";
import { useSidebarStore } from "../../store/sidebarStore";

const Layout: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen, toggleSidebar } = useSidebarStore();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setSidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Main content area */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          !isSidebarOpen ? "mr-0" : "mr-64"
        }`}
      >
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out fixed inset-y-0 right-0 z-50 w-64 lg:fixed lg:right-0 lg:translate-x-0 ${
          !isSidebarOpen ? "lg:translate-x-full lg:w-64" : "lg:w-64"
        }`}
      >
        <Sidebar />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle button - always visible and positioned dynamically on the right */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleSidebar}
        className={`fixed top-4 z-60 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 ${
          isSidebarOpen ? "right-72 lg:right-72" : "right-4 lg:right-4"
        }`}
        aria-label="Toggle sidebar"
      >
        <Icon
          name={isSidebarOpen ? "panel-right-close" : "panel-right-open"}
          size={20}
          className="text-gray-700 dark:text-gray-300"
        />
      </Button>
    </div>
  );
};

export default Layout;
