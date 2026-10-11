import Lottie from "lottie-react";
import loadingAnimation from "../../assets/animations/loading.json";

const Loading = () => {
  return (
    <div className="min-h-screen bg-[#202020] flex flex-col items-center justify-center">
      <div className="max-w-xs w-full">
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          className="w-full h-full"
        />
        <p className="text-gray-400 text-center mt-4 text-lg">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
