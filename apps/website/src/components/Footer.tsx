import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className="bg-black text-white py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <motion.h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Write with Flow
            </motion.h3>
            <motion.p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Compose effortlessly—from journal entries and blog posts to
              speeches or turned for copy—in a clean, distraction-free space
              built to keep you in rhythm.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <motion.h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Code & Creative Scripts
            </motion.h3>
            <motion.p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Draft clean code, content templates, or technical notes directly
              inside Scripelle, blending logic with creativity in one workspace.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <motion.h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Smart Research
            </motion.h3>
            <motion.p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Use the advance Sidebar to research, learn, and generate anything.
            </motion.p>
          </motion.div>

          {/* <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <motion.h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Code & Creative Scripts
            </motion.h3>
            <motion.p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Draft clear code, content templates, or technical notes directly
              inside Scripelle, blending logic with creativity in one workspace.
            </motion.p>
          </motion.div> */}

          {/* <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <motion.h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Smart Research
            </motion.h3>
            <motion.p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Search across documents, links, or saved ideas with one click.
              Organize references and inspiration so everything is always at
              hand.
            </motion.p>
          </motion.div> */}

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-4"
          >
            <motion.h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
              Automation & Inspiration
            </motion.h3>
            <motion.p className="text-sm sm:text-base text-gray-300 leading-relaxed">
              Automate repetitive tasks like formatting, citations, or content
              planning—while Scripelle's subtle cues keep you engaged and
              focused.
            </motion.p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-gray-800 text-center"
        >
          <motion.p className="text-gray-400 text-xs sm:text-sm">
            © 2025 Scripelle. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Footer;
