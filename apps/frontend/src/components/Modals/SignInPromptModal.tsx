import { useNavigate } from "react-router-dom";

interface SignInPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInPromptModal = ({ isOpen, onClose }: SignInPromptModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#1e1e1e]/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-[#1e1e1e] border border-gray-300 rounded-lg shadow-2xl max-w-md w-full p-8 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="flex justify-center mb-6">
            <div className="bg-gray-300 rounded-full p-4">
              <svg
                className="w-12 h-12 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-white mb-3">
              Sign in to Continue
            </h2>
            <p className="text-gray-300 leading-relaxed">
              To save your work and unlock all features of Scripelle,
              please join our beta testers and enjoy exclusive access to the Pro account for free.
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex items-start text-gray-300">
              <svg
                className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Save and sync your documents</span>
            </div>
            <div className="flex items-start text-gray-300">
              <svg
                className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">
                Access AI-powered writing assistant
              </span>
            </div>
            {/* <div className="flex items-start text-gray-300">
              <svg
                className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm">Collaborate with team members</span>
            </div> */}
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSignIn}
              className="w-full bg-white hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Sign In
            </button>
            <button
              onClick={handleSignUp}
              className="w-full bg-white hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignInPromptModal;
