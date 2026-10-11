import MancrossingRoad from "../assets/img/man-line.jpg";
import { motion } from "framer-motion";

const NotAnotherTools = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true, margin: "-200px" }}
      className="relative w-full h-screen bg-cover bg-left"
      style={{ backgroundImage: `url(${MancrossingRoad})` }}
    >
      <div className="absolute inset-0 bg-black/20 sm:bg-transparent"></div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute top-4 sm:top-8 left-4 sm:left-8 text-white z-10 max-w-md sm:max-w-lg"
      >
        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-3 sm:mb-4 poppins-regular"
        >
          This isn't another
          <motion.em
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="italic"
          >
            Writing tool
          </motion.em>
          .
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="text-sm sm:text-base lg:text-lg leading-relaxed poppins-regular"
        >
          We're not just improving the process. We're setting a new benchmark
          for <br className="hidden sm:block" />
          what digital writing should feel like.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="py-3 rounded-full bg-[#313131bf] backdrop-blur-md w-full sm:max-w-fit"
          >
            <input
              type="email"
              placeholder="Enter your email address, and Start the revolution"
              className="bg-transparent outline-none text-white placeholder:text-white/80 text-sm sm:text-base lg:text-lg font-sans w-full sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] text-center px-4 sm:px-6"
            />
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#1f2937" }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="px-6 sm:px-8 py-3 rounded-full bg-black text-white font-medium text-sm sm:text-base lg:text-lg shadow-lg w-full sm:w-auto"
          >
            Submit
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="absolute bottom-8 sm:bottom-16 left-4 sm:left-8 text-white max-w-xs sm:max-w-md z-10"
      >
        <motion.h2
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
          className="text-2xl sm:text-3xl font-semibold mb-3 sm:mb-4"
        >
          The
          <br className="hidden sm:block" />
          new standard
          <br className="hidden sm:block" />
          <motion.em
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="italic"
          >
            has arrived
          </motion.em>
          .
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
          className="text-xs sm:text-sm leading-relaxed"
        >
          Scripelle is our vision for the future. A future where your tools
          don't dictate your thoughts—they liberate them.
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default NotAnotherTools;
