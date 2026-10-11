import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WhiteBackground from "../assets/img/white_background.jpg";
import Header from "./Header";

interface SpotSecuredProps {
  email?: string;
}

const SpotSecured: React.FC<SpotSecuredProps> = () => {
  const [pressed, setPressed] = useState(false);

  const handlePress = () => {
    setPressed(true);
  };
  return (
    <div
      className="relative w-full h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${WhiteBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Header color="black" />
      <div className="absolute inset-0 bg-white/40" />
      <div className="relative z-10 flex flex-col items-center justify-center w-full h-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-[#E2BE64] mb-4 poppins-regular italic">
            Your spot is secured.
          </h1>
          <h2 className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-[#E2BE64] mb-4 poppins-regular italic leading-[1.2]">
            Fewer than a handful will get through this early.
            <br />
            You just did.
          </h2>
        </div>
        <button
          className="px-8 py-4 rounded-full border-2 border-black bg-white/80 text-black font-semibold text-xl shadow-md hover:bg-white transition-all duration-200 mb-8 poppins-regular italic cursor-pointer "
          style={{ fontFamily: "Poppins, sans-serif" }}
          onClick={handlePress}
        >
          What's next?
        </button>
        <AnimatePresence>
          {pressed && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{
                duration: 0.6,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
                damping: 15,
              }}
              className="max-w-4xl w-full mx-auto rounded-2xl border-2 border-gray-400 bg-white/80 text-black text-3xl font-medium text-center py-6 px-4 shadow poppins-regular"
            >
              You'll receive an email regarding the launch date
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SpotSecured;
