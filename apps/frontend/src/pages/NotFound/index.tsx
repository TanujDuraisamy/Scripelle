import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import notFoundAnimation from "../../assets/animations/not-found.json";

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#202020] flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Lottie
          animationData={notFoundAnimation}
          loop={true}
          className="w-full h-64"
        />
        <h1 className="text-4xl font-bold text-white text-center mt-8 mb-4">
          404 - Page Not Found
        </h1>
        <p className="text-gray-400 text-center mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;
