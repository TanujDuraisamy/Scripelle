import Lottie from "lottie-react";
import animationData from "../assets/animations/not-found.json";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#262626] text-gray-200 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Lottie animationData={animationData} className="w-80 h-80" />
        <h1 className="text-5xl font-extrabold text-white">404</h1>
        <h2 className="text-2xl font-semibold text-gray-300">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-400 max-w-md">
          Looks like the page you’re trying to reach doesn’t exist or has been
          moved.
        </p>
        <button
          onClick={handleClick}
          className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
