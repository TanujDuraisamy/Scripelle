import { motion } from "framer-motion";
import ChatImg from "../../assets/img/chat_box.png";

const AdvancedSidebar = () => {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-70 sm:w-80 md:w-80 lg:w-80 xl:w-80 h-[400px] sm:h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl pt-5`}
      style={{
        backgroundImage: `url(${ChatImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 w-3 h-3 sm:w-5 sm:h-5 bg-white rounded-full z-10"
      ></motion.div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between">
        <div className="flex flex-col space-y-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-white poppins-regular font-normal text-xl sm:text-4xl lg:text-3xl xl:text-4xl leading-none text-center"
          >
            Advance Sidebar
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-white/90 text-base sm:text-2xl/6 text-left times-new-roman"
          >
            The all-in-one powerful sidebar unlocks your maximum potential when
            writing.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-white/90 text-base sm:text-2xl/6 text-left times-new-roman"
          >
            Use it to assist you with your writing.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedSidebar;
