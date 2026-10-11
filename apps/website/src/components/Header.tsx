import { motion } from "framer-motion";

interface HeaderProps {
  color?: string;
}

const Header: React.FC<HeaderProps> = ({ color = "white" }) => {
  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
      className="text-center font-garamond-italics text-2xl sm:text-3xl lg:text-4xl tracking-tightest py-2 sm:py-3 italic"
      style={{ color }}
    >
      Scripelle
    </motion.div>
  );
};

export default Header;
