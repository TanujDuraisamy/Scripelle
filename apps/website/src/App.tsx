import EmailNavigation from "./components/EmailNavigation";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import Reclaim from "./components/Reclaim";
import ScrollSection from "./components/scrollsection";
import StudentStruggle from "./components/StudentStruggle";

const App = () => {
  return (
    <div>
      <Hero />
      <Reclaim />
      <StudentStruggle />
      {/* <PureFocus /> */}
      <ScrollSection />
      {/* <NotAnotherTools /> */}
      <Pricing />
      <EmailNavigation />
      <Footer />
    </div>
  );
};

export default App;
