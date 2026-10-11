import EarlyAccessBanner from "./EarlyAccessBanner";
import PricingBackground from "../assets/img/pricing_bg.png";

const Pricing = () => {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-20 sm:opacity-25 lg:opacity-30"
        style={{
          backgroundImage: `url(${PricingBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <EarlyAccessBanner />

      <div className="relative z-10 flex flex-col justify-center min-h-screen px-4 sm:px-6 md:px-12 lg:px-16 xl:px-24 py-6 sm:py-8 lg:py-16 pt-20 sm:pt-24 lg:pt-20">
        {/* Header */}
        <div className="my-8 sm:mb-10 lg:mb-12 w-full">
          <h1 className="text-[clamp(1.5rem,5vw,5rem)] mb-4 sm:mb-5 lg:mb-6 text-center sm:text-left poppins-regular font-medium italic">
            How it works:
          </h1>
          <div className="flex items-center justify-center sm:justify-start">
            <p className="text-[clamp(0.875rem,2vw,1.875rem)] text-gray-300 max-w-5xl poppins-regular font-medium text-center sm:text-left px-2 sm:px-0">
              Every automatic operation by Scripelle uses up{" "}
              <span className="font-bold text-white">ONE CREDIT.</span>
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:gap-10 max-w-7xl w-full mx-auto pb-8 lg:pb-0">
          {/* Free Plan */}
          <div className="bg-[#2e2f2e] backdrop-blur-sm rounded-xl p-[clamp(1rem,2vw,2.5rem)] flex-1 border border-gray-700 w-full hover:border-gray-500 transition-all duration-300">
            <div className="text-center mb-4 sm:mb-5 lg:mb-6">
              <h3 className="text-[clamp(1.125rem,2.5vw,1.875rem)] font-bold mb-3 sm:mb-4">
                Free
              </h3>
              <div className="text-[clamp(1.875rem,4vw,3.75rem)] font-bold mb-3 sm:mb-4">
                $0
              </div>
              <p className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)] italic leading-relaxed px-2">
                "A glimpse into the art of writing with Scripelle."
              </p>
            </div>

            <div className="text-center mb-5 sm:mb-6 lg:mb-8">
              <div className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold">20</div>
              <div className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)] mt-1">
                Credits
              </div>
              <div className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)]">
                per month
              </div>
              <div className="w-full h-px bg-gray-600 mt-4 sm:mt-5 lg:mt-6"></div>
            </div>

            <ul className="space-y-3 sm:space-y-4 text-[clamp(0.75rem,1.5vw,1rem)] mb-5 sm:mb-6 lg:mb-8">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Get a taste of Scripelle</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Access to the editor</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Auto Suggestions</span>
              </li>
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="bg-[#2e3c31] backdrop-blur-sm rounded-xl p-[clamp(1rem,2vw,2.5rem)] flex-1 border-2 border-orange-500 relative w-full hover:border-orange-400 transition-all duration-300 shadow-lg shadow-orange-500/20">
            <div className="text-center mb-4 sm:mb-5 lg:mb-6">
              <h3 className="text-[clamp(1.125rem,2.5vw,1.875rem)] font-bold mb-3 sm:mb-4">
                Pro
              </h3>
              <div className="text-[clamp(1.875rem,4vw,3.75rem)] font-bold mb-3 sm:mb-4">
                $8.99
              </div>
              <p className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)] italic leading-relaxed px-2">
                "For those who wants more freedom, input flow, more expression."
              </p>
            </div>

            <div className="text-center mb-5 sm:mb-6 lg:mb-8">
              <div className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold">50</div>
              <div className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)] mt-1">
                Credits
              </div>
              <div className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)]">
                per month
              </div>
              <div className="w-full h-px bg-gray-600 mt-4 sm:mt-5 lg:mt-6"></div>
            </div>

            <ul className="space-y-3 sm:space-y-4 text-[clamp(0.75rem,1.5vw,1rem)] mb-5 sm:mb-6 lg:mb-8">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Everything in Free</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>More Personalized</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Better Auto Suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Faster Response</span>
              </li>
            </ul>
          </div>

          {/* Max Plan */}
          <div className="bg-[#412e2e] backdrop-blur-sm rounded-xl p-[clamp(1rem,2vw,2.5rem)] flex-1 border border-gray-600 w-full hover:border-gray-500 transition-all duration-300">
            <div className="text-center mb-4 sm:mb-5 lg:mb-6">
              <h3 className="text-[clamp(1.125rem,2.5vw,1.875rem)] font-bold mb-3 sm:mb-4">
                Max
              </h3>
              <div className="text-[clamp(1.875rem,4vw,3.75rem)] font-bold mb-3 sm:mb-4">
                $14.99
              </div>
              <p className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)] italic leading-relaxed px-2">
                "For creators who demand the fullest expression."
              </p>
            </div>

            <div className="text-center mb-5 sm:mb-6 lg:mb-8">
              <div className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold">150</div>
              <div className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)] mt-1">
                Credits
              </div>
              <div className="text-gray-400 text-[clamp(0.75rem,1.5vw,1rem)]">
                per month
              </div>
              <div className="w-full h-px bg-gray-600 mt-4 sm:mt-5 lg:mt-6"></div>
            </div>

            <ul className="space-y-3 sm:space-y-4 text-[clamp(0.75rem,1.5vw,1rem)] mb-5 sm:mb-6 lg:mb-8">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Unlimited Inline Edits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Best Auto Suggestions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 bg-white rounded-full flex-shrink-0 mt-1.5"></span>
                <span>Fastest Response</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
