import { motion } from "framer-motion";

const Overthinking = () => {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-70 sm:w-80 md:w-80 lg:w-80 xl:w-80 h-[400px] sm:h-[500px] rounded-2xl overflow-hidden shadow-2xl mx-auto pt-10`}
      style={{
        backgroundColor: "#2e2f2e",
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
            className="text-white poppins-regular font-normal text-lg sm:text-4xl lg:text-3xl xl:text-4xl leading-none text-center"
          >
            Write without overthinking
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-white/90 times-new-roman text-base sm:text-2xl/6 leading-relaxed text-left"
          >
            Writing tools does not give you a hand when you don’t know what to
            say next.
          </motion.p>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-white/90 times-new-roman text-base sm:text-2xl/6 leading-relaxed text-left italic"
          >
            Scripelle changed that.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default Overthinking;
