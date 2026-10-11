import { motion } from "framer-motion";
import { GoArrowRight, GoClock } from "react-icons/go";

interface IEarlyAccessBannerProps {
  color?: string;
  mode?: "normal" | "final";
}

const EarlyAccessBanner: React.FC<IEarlyAccessBannerProps> = ({
  color = "#FF0000",
  mode = "normal",
}) => {
  const actualColor = mode === "final" ? "#FF9500" : color;
  const scrollToEarlyAccess = () => {
    const section = document.getElementById("early-access-section");
    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      className="absolute top-2 right-0 z-20 flex flex-col gap-2 max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-3rem)] lg:max-w-[calc(100vw-4rem)]"
    >
      <div className="flex flex-col items-center gap-2">
        <GoClock
          className={`stroke-[1]`}
          style={{ color: actualColor }}
          size={18}
        />
        <div className="w-full max-w-[200px] sm:max-w-xs h-1 bg-gray-600 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full`}
            style={{ backgroundColor: actualColor, width: "70%" }}
          ></div>
        </div>
      </div>

      <button
        onClick={scrollToEarlyAccess}
        className="flex items-center gap-1 sm:gap-2 rounded-full px-2 py-1 sm:px-4 sm:py-2 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
        aria-label="Navigate to early access section"
      >
        <span
          className={`text-sm sm:text-lg lg:text-xl font-bold underline group-hover:opacity-80 transition-colors duration-300 poppins-regular truncate`}
          style={{ color: actualColor }}
        >
          Early access perks ends Oct 15th
        </span>

        <GoArrowRight
          className="group-hover:opacity-80 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0"
          style={{ color: actualColor }}
          size={14}
        />
      </button>
    </motion.div>
  );
};

export default EarlyAccessBanner;
