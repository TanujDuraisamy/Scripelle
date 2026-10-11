import RingsBg from "/src/assets/img/rings.jpg";
import { motion } from "framer-motion";

const PureFocus = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      viewport={{ once: true, margin: "-200px" }}
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{
        backgroundImage: `url("${RingsBg}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#000",
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-32 sm:pt-36 lg:pt-28">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl poppins-regular font-bold mb-4 sm:mb-6 tracking-tightest"
        >
          Designed for <br />
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="block sm:inline"
          >
            <span className="times-new-roman italics">Pure</span>{" "}
            <span className="">Focus</span>
          </motion.span>
        </motion.h1>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-base sm:text-lg md:text-xl lg:text-xl poppins-regular font-light tracking-wide opacity-90 max-w-4xl mx-auto italics"
        >
          Everything you need to write, and nothing you don't.
        </motion.p>
      </div>
    </motion.div>
  );
};

export default PureFocus;
