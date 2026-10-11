import { motion } from "framer-motion";

interface CardProps {
  title: string;
  image?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showIndicator?: boolean;
  height?: string;
}

const Card = ({ title, image, showIndicator = true }: CardProps) => {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.02,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-80 max-w-2xl sm:w-80 md:w-[300px] lg:w-[400px] h-[400px] sm:h-[500px] bg-black rounded-2xl overflow-hidden shadow-2xl mx-auto`}
      style={{
        backgroundImage: image ? `url(${image})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 rounded-2xl"></div>

      {showIndicator && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full z-10"
        ></motion.div>
      )}

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-center items-center text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-white poppins-regular text-3xl sm:text-5xl lg:text-5xl leading-none text-center"
        >
          {title}
        </motion.h1>
        {/* {subtitle && (
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="text-white/90 font-garamond text-base sm:text-lg leading-relaxed text-center mt-4"
          >
            {subtitle}
          </motion.p>
        )} */}
      </div>
    </motion.div>
  );
};

export default Card;
