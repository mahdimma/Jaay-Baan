import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "../ui";

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const nameMapping: { [key: string]: string } = {
    search: "جستجو",
    statistics: "آمار",
    cleaning: "تمیزکاری",
  };

  const mainPages = [
    { path: "/", name: "خانه", icon: "home" as const },
    { path: "/search", name: "جستجو", icon: "search" as const },
    { path: "/statistics", name: "آمار", icon: "bar-chart" as const },
    { path: "/cleaning", name: "تمیزکاری", icon: "refresh" as const },
  ];

  // Check if current path is one of the main pages
  const isMainPage = mainPages.some((page) => page.path === location.pathname);

  return (
    <nav className="flex flex-col" aria-label="Breadcrumb">
      {/* Main page buttons */}
      <div className="flex items-center space-x-2 space-x-reverse mb-3">
        {mainPages.map((page) => (
          <Link
            key={page.path}
            to={page.path}
            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              location.pathname === page.path
                ? "bg-blue-600 text-white shadow-sm"
                : "text-gray-800 hover:text-blue-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200"
            }`}
          >
            <Icon name={page.icon} className="w-4 h-4 ml-2" />
            {page.name}
          </Link>
        ))}
      </div>

      {/* Traditional breadcrumb - only show for non-main pages */}
      {!isMainPage && pathnames.length > 0 && (
        <ol className="inline-flex items-center space-x-1 md:space-x-2 space-x-reverse">
          {pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const name = nameMapping[value] || value;

            return (
              <li key={to}>
                <div className="flex items-center">
                  {index > 0 && (
                    <Icon
                      name="chevron-left"
                      className="w-3 h-3 text-gray-600 mx-1"
                    />
                  )}
                  {isLast ? (
                    <span className="ms-1 text-sm font-medium text-gray-800 md:ms-2">
                      {name}
                    </span>
                  ) : (
                    <Link
                      to={to}
                      className="ms-1 text-sm font-medium text-gray-800 hover:text-blue-600 md:ms-2"
                    >
                      {name}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
};

export default Breadcrumb;
