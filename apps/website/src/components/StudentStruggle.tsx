import { motion } from "framer-motion";
import { GoArrowRight } from "react-icons/go";
import Background from "../assets/img/students_struggle.png";
import { useState } from "react";

const StudentStruggle = () => {
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailValue,
          source: "Student Struggle Section",
        }),
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
  return (
    <div
      className="bg-black min-h-screen px-4 sm:px-6 lg:px-8 relative flex flex-col"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "auto 100%",
        backgroundPosition: "right center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/60 bg-opacity-50 z-0"></div>

      <div className="relative z-10 flex flex-col h-full min-h-screen">
        <div className="flex justify-center pt-12 sm:pt-16 lg:pt-20">
          <div>
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="text-white text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-bold leading-tight text-left"
            >
              <span className="italic">Every student struggles.</span>{" "}
              <span className="italic">Top students use</span>{" "}
              <span className="italic">Scripelle</span>.
            </motion.h1>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-start pl-8 sm:pl-12 lg:pl-60">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="text-left max-w-5xl"
          >
            <div className="mb-4">
              <p className="text-white text-xl sm:text-2xl font-bold">
                Students who tried Scripelle have had
              </p>
              <div className="text-white text-5xl sm:text-6xl lg:text-7xl font-bold">
                <span>86% better results</span>{" "}
                <span className="text-xl sm:text-2xl font-bold">
                  than with{" "}
                  <span className="text-orange-400 font-bold">
                    Google Docs or Notion.
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pb-12 sm:pb-16 lg:pb-50">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="text-center space-y-6"
          >
            <h2 className="text-white text-2xl sm:text-3xl font-medium">
              Find out how.
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-full sm:max-w-2xl mx-auto">
              <motion.form
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8 md:mt-10 w-full px-4 sm:px-6 max-w-full"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className="py-[clamp(0.75rem,1.5vw,1.5rem)] rounded-full bg-[#313131bf] backdrop-blur-md w-full sm:max-w-[600px] relative"
                >
                  <input
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="bg-transparent outline-none text-white text-[clamp(0.875rem,1vw,1.25rem)] font-sans w-full text-center px-4 sm:px-6 disabled:opacity-70"
                  />
                  {!emailValue && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white/70 text-[clamp(0.875rem,1vw,1.25rem)] gap-1">
                      <span className="poppins-regular font-light">
                        Enter your email address to
                      </span>
                      <span className="times-new-roman-italic">
                        reserve your early spot
                      </span>
                    </div>
                  )}
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting || !emailValue.trim()}
                  whileHover={{
                    scale: isSubmitting ? 1 : 1.1,
                    rotate: isSubmitting ? 0 : 5,
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="w-[clamp(2.5rem,6vw,3.5rem)] h-[clamp(2.5rem,6vw,3.5rem)] flex items-center justify-center rounded-full bg-[#4a4a4a80] backdrop-blur-md shadow-lg flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <GoArrowRight
                      color="#fff"
                      size={20}
                      className="sm:w-6 sm:h-6 md:w-7 md:h-7"
                    />
                  )}
                </motion.button>
              </motion.form>

              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 text-green-400 text-center poppins-regular"
                >
                  ✓ Thank you! Your spot has been reserved.
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentStruggle;
