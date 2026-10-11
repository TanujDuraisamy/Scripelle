import Card from "./Card";
import HouseImg from "../assets/img/house.jpg";
import keyboardImg from "../assets/img/keyboard_img.jpg";
import DoorImg from "../assets/img/door.jpg";
import { motion } from "framer-motion";
import EarlyAccessBanner from "./EarlyAccessBanner";
import CinemaImg from "../assets/img/cinema.jpg";

const ScrollSection = () => {
  const cards = [
    {
      title: "Write with absolute flow",
      image: HouseImg,
    },
    {
      title: "Experience frictionless writing",
      image: CinemaImg,
    },
    {
      title: "Stay free from AI detection",
      image: keyboardImg,
    },
    {
      title: "Tailored for swiftness in writing",
      image: DoorImg,
    },
  ];

  return (
    <div className="min-h-screen py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center relative">
      <EarlyAccessBanner />

      <div className="text-center mb-12 sm:mb-16 lg:mb-20 max-w-6xl mx-auto">
        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl poppins-regular mb-4 sm:mb-6 pt-10"
        >
          Designed for{" "}
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="block sm:inline italic times-new-roman-italic"
          >
            Pure
          </motion.span>{" "}
          Focus.
        </motion.h2>
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-base sm:text-lg/6 md:text-xl/6 poppins-regular text-gray-600 leading-relaxed max-w-4xl mx-auto"
        >
          Everything you need to write, and nothing you don't. Scripelle
          consolidates your workflow so you can focus on one thing: the words.
        </motion.p>
      </div>

      <div className="relative">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="overflow-x-auto scrollbar-hide"
        >
          <div
            className="flex gap-4 sm:gap-6 pb-4 pt-4 pl-4 sm:pl-0"
            style={{ width: "max-content" }}
          >
            {cards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.6 + index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true, margin: "-50px" }}
                className="flex-shrink-0 w-96 sm:w-[500px] md:w-[300px] lg:w-[400px]"
              >
                <Card
                  title={card.title}
                  image={card.image}
                  showIndicator={true}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* <div className="absolute left-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-4 sm:w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div> */}
      </div>
    </div>
  );
};

export default ScrollSection;
