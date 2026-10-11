import type { StoredDocument } from "../types/customTypes";
import { Link, useNavigate } from "react-router-dom";
import BackgroundVideo from "../assets/videos/painting_bg.mp4";
import useEditorStore from "../store/editorStore";
import useUserStore from "../store/userStore";
import { useEffect, useState } from "react";
import { auth } from "../utils/handleHttp";
import SignInPromptModal from "../components/Modals/SignInPromptModal";
import { toast } from "react-toastify";

const StartPage = () => {
  const [showSignInModal, setShowSignInModal] = useState(false);
  const navigate = useNavigate();
  const { createNewDocument: createDocumentInStore } = useEditorStore();
  const { user, loading } = useUserStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const createNewDocument = async () => {
    if (loading === true) {
      toast.info("Checking authentication, please wait...");
    }
    if (user === null) {
      setShowSignInModal(true);
      return;
    }
    const documentId = await createDocumentInStore();
    if (documentId) {
      navigate(`/editor?id=${documentId}`);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const response = await auth<{ data: StoredDocument[] }>({
      method: "GET",
      url: "documents",
    });

    if (response.type === "success") {
      if (response.data?.data.length !== 0) {
        navigate("/dashboard");
      }
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#262626]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={BackgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="relative z-10 w-full h-full">
        <div className="absolute top-8 w-full flex justify-center">
          <h1 className="text-2xl font-bold text-white text-center font-[Yatching] italic select-none">
            Scripelle
          </h1>
        </div>

        <div className="absolute top-10 right-10">
          {!user ? (
            <Link to="/login">
              <button className="bg-[#252526] text-white border-none rounded-md font-medium text-[0.9rem] cursor-pointer ml-3 mr-2 transition-colors duration-200 shadow-none h-8 px-[15px] py-2 flex items-center hover:bg-[#35363a]">
                Sign In
              </button>
            </Link>
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-gray-700 transition-colors"
              title={`${user?.firstName} ${user?.lastName}`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {user?.firstName?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center w-full h-full">
          <button
            className="bg-[rgba(42,42,42,0.9)] text-[#ebe0c9] border-none rounded-full h-20 px-[45px] text-[20px] leading-none font-serif tracking-[0.2px] cursor-pointer shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),_0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-[10px] transition-transform duration-[80ms] ease-in-out hover:shadow-lg hover:scale-105"
            onClick={createNewDocument}
          >
            Start Writing
          </button>
        </div>
      </div>

      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </div>
  );
};

export default StartPage;
