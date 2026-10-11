import Header from "./Header";
import Rocket from "../assets/img/rocket.jpg";
import { GoArrowRight } from "react-icons/go";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const TypewriterSubtitle = () => {
  const lines = [
    "Scripelle fixed that. We redefined writing.",
    "A brand new all-in-one writing tool",
  ];
  const [currentLine, setCurrentLine] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startDelay = setTimeout(() => setIsTyping(true), 800);
    return () => clearTimeout(startDelay);
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isTyping && displayedText.length < lines[currentLine].length) {
      timeout = setTimeout(() => {
        setDisplayedText(lines[currentLine].slice(0, displayedText.length + 1));
      }, 45);
    } else if (isTyping && displayedText.length === lines[currentLine].length) {
      timeout = setTimeout(() => {
        setDisplayedText("");
        setCurrentLine((prev) => (prev + 1) % lines.length);
      }, 1500);
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, currentLine, lines]);

  return (
    <motion.h2
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      className="text-center font-light italic poppins-regular max-w-[90%] sm:max-w-2xl md:max-w-3xl xl:max-w-4xl mx-auto text-[clamp(0.9rem,2vw,1.5rem)] min-h-[2.5rem] sm:min-h-[3rem]"
    >
      {displayedText}
      {isTyping && <span className="animate-pulse text-white">|</span>}
    </motion.h2>
  );
};

const Hero = () => {
  const [emailValue, setEmailValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT;
      if (!endpoint) throw new Error("Waitlist submissions are not configured");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, source: "Hero Section" }),
      });
      if (response.ok) {
        setIsSubmitted(true);
        setEmailValue("");
        setTimeout(() => setIsSubmitted(false), 3000);
      }
    } catch (error) {
      console.error("Error submitting email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClick = () => {
    const section = document.getElementById("early-access-section");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat flex flex-col"
      style={{
        backgroundImage: `url(${Rocket})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex flex-col flex-grow">
        <Header />

        <div className="flex flex-col items-center justify-center text-white flex-grow px-4 sm:px-6 md:px-8 text-center">
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="poppins-regular italic font-medium leading-tight tracking-tightest mt-10 sm:mt-12 mb-4 text-[clamp(2.5rem,7vw,7rem)]"
          >
            Writing is{" "}
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="times-new-roman-italic font-normal tracking-tightest leading-tight transform scale-x-75"
            >
              Broken
            </motion.span>
          </motion.h1>

          <TypewriterSubtitle />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-4 sm:mt-6"
          >
            <p className="poppins-regular italic text-[clamp(0.9rem,2vw,1.2rem)] font-light">
              Launching:{" "}
              <span className="text-orange-400 font-bold">
                November 3rd 2025
              </span>
            </p>
            <p className="poppins-regular italic text-[clamp(0.9rem,2vw,1.2rem)] font-light">
              Reserve your spot today —{" "}
              <span className="text-orange-400 font-bold">
                First 50 get special perks
              </span>
            </p>
          </motion.div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[95%] sm:max-w-2xl md:max-w-3xl"
          >
            <div className="relative flex-grow w-full">
              <input
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                disabled={isSubmitting}
                required
                placeholder="Enter your email address to reserve your spot"
                className="w-full py-3 sm:py-4 px-4 sm:px-6 rounded-full bg-[#313131bf] backdrop-blur-md text-white text-center text-[clamp(0.85rem,1.6vw,1rem)] placeholder-white/70 outline-none disabled:opacity-70"
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting || !emailValue.trim()}
              whileHover={{
                scale: isSubmitting ? 1 : 1.1,
                rotate: isSubmitting ? 0 : 5,
              }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-[#4a4a4a80] backdrop-blur-md shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <GoArrowRight className="text-white text-xl sm:text-2xl" />
              )}
            </motion.button>
          </motion.form>

          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 text-green-400 poppins-regular"
            >
              ✓ Thank you! Your spot has been reserved.
            </motion.div>
          )}

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-10 w-full px-4 sm:px-6 max-w-2xl mx-auto"
          >
            <div className="w-full bg-gray-600 rounded-full h-1 mb-4">
              <div
                className="bg-[#F81818] h-1 rounded-full"
                style={{ width: "70%" }}
              ></div>
            </div>

            <p className="text-orange-400 font-bold italic poppins-regular text-[clamp(0.9rem,2vw,1.2rem)] mb-2">
              Early access perks end Oct 15th
            </p>

            <div
              onClick={handleClick}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer"
            >
              <p className="underline text-orange-400 font-bold italic text-[clamp(0.9rem,2vw,1.2rem)]">
                First 50 members get special perks
              </p>
              <GoArrowRight className="text-orange-400" size={22} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
