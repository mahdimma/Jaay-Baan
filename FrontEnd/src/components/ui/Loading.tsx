import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className = "",
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return <div className={`spinner ${sizes[size]} ${className}`} />;
};

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

const Loading: React.FC<LoadingProps> = ({
  text = "در حال بارگذاری...",
  size = "md",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size={size} />
      <p className="mt-2 text-gray-500">{text}</p>
    </div>
  );
};

export { LoadingSpinner };
export default Loading;
