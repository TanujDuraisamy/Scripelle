import Lottie from "lottie-react";
import animationData from "../assets/animations/loading.json";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen bg-black overflow-hidden">
      <Lottie animationData={animationData} className="w-96 h-96" />
    </div>
  );
};

export default Loading;
