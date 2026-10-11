// import Keyboard from "../assets/img/keyboard_img.jpg";
// import Rings from "../assets/img/rings.jpg";
// import { motion } from "framer-motion";
// import AdvancedSidebar from "./Cards/AdvancedSidebar";
// import Overthinking from "./Cards/Overthinking";
// import StopBlankPage from "./Cards/StopBlankPage";

// const cards w= [
//   {
//     title: "Advance Sidebar",
//     subtitle:
//       "The all-in-one powerful sidebar unlocks your maximum potential when writing. Use it to assist you with your writing.",
//     image: Keyboard,
//   },
//   {
//     title: "Write without overthinking",
//     subtitle:
//       "Writing tools does not give you a hand when you don’t know what to say next. Scripelle changed that.",
//     image: Rings,
//   },
//   {
//     title: "Stop starting at a blank page",
//     subtitle:
//       "People are stuck at staring at a blank page when they don’t know how to start or what to say next. With Scripelle’s advanced suggestion feature, you will never face those issues again.",
//     image: Rings,
//   },
// ];

// const Reclaim = () => {
//   return (
//     <div className="bg-white py-8 sm:py-10 px-4 sm:px-6 lg:px-10 min-h-screen flex flex-col justify-center">
//       <motion.h3
//         initial={{ y: 30, opacity: 0 }}
//         whileInView={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         viewport={{ once: true, margin: "-100px" }}
//         className="text-3xl sm:text-3xl lg:text-4xl font-semibold mb-2 sm:mb-4 poppins-regular"
//       >
//         We solved all your issues{" "}
//         <span className="italic times-new-roman tracking-tight">
//           with Scripelle.
//         </span>
//       </motion.h3>
//       <motion.p
//         initial={{ y: 20, opacity: 0 }}
//         whileInView={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
//         viewport={{ once: true, margin: "-100px" }}
//         className="poppins-regular text-sm sm:text-base lg:text-lg leading-relaxed max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl"
//       >
//         Scripelle is a new standard for writing. A tool built from the ground up
//         to eliminate distractions, amplify your writings, and get you from
//         thoughts to final draft, seamlessly.
//       </motion.p>

//       <motion.div
//         initial={{ y: 50, opacity: 0 }}
//         whileInView={{ y: 0, opacity: 1 }}
//         transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
//         viewport={{ once: true, margin: "-100px" }}
//         className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-20 mt-8 sm:mt-12 lg:mt-20 items-start justify-start"
//       >
//         <AdvancedSidebar />
//         <Overthinking />
//         <StopBlankPage />
//       </motion.div>
//     </div>
//   );
// };

// export default Reclaim;

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import AdvancedSidebar from "./Cards/AdvancedSidebar";
import Overthinking from "./Cards/Overthinking";
import StopBlankPage from "./Cards/StopBlankPage";
import EarlyAccessBanner from "./EarlyAccessBanner";

const Reclaim = () => {
  const [visibleCardsCount, setVisibleCardsCount] = useState(1);
  const [isResetting] = useState(false);

  const cards = [
    { component: <AdvancedSidebar />, key: "advanced" },
    { component: <Overthinking />, key: "overthinking" },
    { component: <StopBlankPage />, key: "blankpage" },
  ];

  const showNextCard = () => {
    setVisibleCardsCount((prev) => Math.min(prev + 1, cards.length));
  };


  return (
    <div className="bg-white py-8 sm:py-10 px-4 sm:px-6 lg:px-10 min-h-screen flex flex-col justify-center relative overflow-hidden">
      <EarlyAccessBanner />
      <motion.h3
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-3xl sm:text-3xl md:text-3xl lg:text-4xl xl:text-5xl mb-2 sm:mb-4 poppins-regular pt-16 sm:pt-12 lg:pt-0"
      >
        We solved all your issues{" "}
        <span className="italic times-new-roman tracking-tight font-normal">
          with Scripelle
        </span>
      </motion.h3>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="poppins-regular text-sm sm:text-base lg:text-lg/6 leading-relaxed"
      >
        Scripelle is a new standard for writing. An environment built from the
        ground up to eliminate distractions,
        <br /> amplify your voice, and get you from thought to final draft,
        seamlessly.
      </motion.p>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="flex md:hidden overflow-x-auto overflow-y-hidden gap-4 mt-8 sm:mt-12 pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.key}
            initial={{ y: 60, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.6 + index * 0.2,
              ease: "easeOut",
            }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex-shrink-0 w-80 sm:w-96"
          >
            {card.component}
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
        className="hidden md:flex items-center justify-center mt-8 sm:mt-12 lg:mt-20 relative"
      >
        <div className="flex items-center justify-center">
          {/* {visibleCardsCount > 1 && (
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              onClick={resetCards}
              className="mr-3 sm:mr-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-gray-600 hover:bg-gray-500 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="Reset to first card"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-5 sm:h-5"
              >
                <polyline points="1,4 1,10 7,10"></polyline>
                <path d="M3.51,15a9,9 0 1,0 2.13-9.36L1,10"></path>
              </svg>
            </motion.button>
          )} */}

          <motion.div
            className={`flex justify-center ${
              visibleCardsCount === 1
                ? "gap-0"
                : visibleCardsCount === 2
                ? "gap-4 sm:gap-6"
                : "gap-3 sm:gap-4 lg:gap-6"
            }`}
            layout
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <AnimatePresence mode="popLayout">
              {cards.slice(0, visibleCardsCount).map((card, index) => (
                <motion.div
                  key={card.key}
                  layout
                  initial={{
                    x: isResetting ? 0 : 300,
                    opacity: isResetting ? 1 : 0,
                    scale: isResetting ? 1 : 0.8,
                  }}
                  animate={{
                    x: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    x: isResetting ? 300 : -300,
                    opacity: 0,
                    scale: 0.8,
                  }}
                  transition={{
                    layout: { duration: 0.6, ease: "easeOut" },
                    x: { duration: 0.6, ease: "easeOut", delay: index * 0.05 },
                    opacity: { duration: 0.4, delay: index * 0.05 },
                    scale: { duration: 0.4, delay: index * 0.05 },
                  }}
                  className="flex-shrink-0"
                  style={{
                    transformOrigin: "center center",
                  }}
                >
                  {card.component}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {visibleCardsCount < cards.length && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={showNextCard}
              className="ml-3 sm:ml-4 z-10 w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              aria-label="Show next card"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-5 sm:h-5"
              >
                <polyline points="9,18 15,12 9,6"></polyline>
              </svg>
            </motion.button>
          )}
        </div>

        <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 flex space-x-2">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index < visibleCardsCount ? "bg-gray-800" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Reclaim;
