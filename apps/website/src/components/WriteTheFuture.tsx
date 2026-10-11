import WhiteBackground from "../assets/img/white_background.jpg";
import EarlyAccessBanner from "./EarlyAccessBanner";
import { GoArrowRight } from "react-icons/go";
import { motion } from "framer-motion";
import { useState } from "react";

interface WriteTheFutureProps {
  onEmailSubmit?: (email: string) => void;
}

const WriteTheFuture: React.FC<WriteTheFutureProps> = ({ onEmailSubmit }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const endpoint = import.meta.env.VITE_WAITLIST_ENDPOINT;
      if (!endpoint) throw new Error("Waitlist submissions are not configured");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "Write The Future Section" }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail("");
        setTimeout(() => setIsSubmitted(false), 3000);
        if (onEmailSubmit) onEmailSubmit(email);
      }
    } catch (error) {
      console.error("Error submitting email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      viewport={{ once: true, margin: "-200px" }}
      className="relative w-full h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${WhiteBackground})` }}
    >
      <EarlyAccessBanner mode="final" />
      <div className="absolute inset-0 bg-white/20"></div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-[clamp(1rem,4vw,6rem)]">
        {/* Heading */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="font-bold poppins-regular italic leading-[1.3] text-gray-900 mb-4 sm:mb-6"
          style={{
            fontSize: "clamp(1.5rem, 3vw, 4.5rem)",
            maxWidth: "90vw",
            margin: "0 auto",
          }}
        >
          First 50 early signers get{" "}
          <span className="text-red-500">100 days of UNLIMITED Credits</span>{" "}
          <br />
          Offer ends at October 15th.
        </motion.h1>

        {/* Input + Button */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-[clamp(1.5rem,4vw,3rem)] w-full max-w-[650px] flex flex-col sm:flex-row items-center gap-[clamp(0.5rem,1vw,1.5rem)]"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="w-full sm:flex-1 py-[clamp(0.75rem,1vw,1.5rem)] rounded-full bg-white/30 backdrop-blur-md border-[2px] flex items-center justify-center"
            style={{ borderColor: "#AD924D" }}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your email address to reserve your early spot"
              className="bg-transparent outline-none text-gray-900 placeholder:text-gray-600/80 text-[clamp(0.875rem,1.5vw,1.125rem)] font-sans w-full text-center px-4 sm:px-6 poppins-regular font-bold italic"
            />
          </motion.div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center justify-center rounded-full transition-colors w-[clamp(3rem,6vw,4rem)] h-[clamp(3rem,6vw,4rem)] ${
              isSubmitted
                ? "bg-green-500 hover:bg-green-600"
                : isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#AD924D] hover:bg-[#C5A65A]"
            }`}
            aria-label="Submit Email"
          >
            {isSubmitted ? (
              <span className="text-white text-[clamp(0.875rem,1.5vw,1.125rem)]">
                ✓
              </span>
            ) : isSubmitting ? (
              <span className="text-white text-[clamp(0.875rem,1.5vw,1.125rem)]">
                ...
              </span>
            ) : (
              <GoArrowRight
                className="text-white drop-shadow-lg"
                size={22}
                style={{ filter: "brightness(1.2)" }}
              />
            )}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WriteTheFuture;
