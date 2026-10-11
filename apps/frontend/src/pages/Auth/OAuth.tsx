import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserStore from "../../store/userStore";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { refreshJwtNonLoad } = useUserStore();

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    await refreshJwtNonLoad();
    navigate("/editor");
  };

  return (
    <div className="flex items-center justify-center h-screen text-white">
      Signing you in with Google...
    </div>
  );
};

export default OAuthSuccess;
