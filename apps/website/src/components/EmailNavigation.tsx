import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import WriteTheFuture from "./WriteTheFuture";
import SpotSecured from "./SpotSecured";

const EmailNavigation = () => {
  const [currentPage, setCurrentPage] = useState<
    "writeTheFuture" | "spotSecured"
  >("writeTheFuture");
  const [email, setEmail] = useState("");

  const handleEmailSubmit = (submittedEmail: string) => {
    if (submittedEmail.trim()) {
      setEmail(submittedEmail);
      setCurrentPage("spotSecured");
    }
  };

  return (
    <div id="early-access-section" className="relative w-full min-h-screen">
      <AnimatePresence mode="wait">
        {currentPage === "writeTheFuture" && (
          <motion.div
            key="writeTheFuture"
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            <WriteTheFuture onEmailSubmit={handleEmailSubmit} />
          </motion.div>
        )}

        {currentPage === "spotSecured" && (
          <motion.div
            key="spotSecured"
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="w-full h-full"
          >
            <SpotSecured email={email} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmailNavigation;
