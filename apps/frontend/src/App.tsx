import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { useEffect, useState } from "react";
import useUserStore from "./store/userStore";
import StartPage from "./pages/StartPage.tsx";
import LoginScreen from "./pages/Auth/Login.tsx";
import SignUp from "./pages/Auth/SignUp.tsx";
import ForgotPassword from "./pages/Auth/ForgotPassword.tsx";
import ResetPassword from "./pages/Auth/ResetPassword.tsx";
import EditorPage from "./pages/EditorPage.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import ToastContainer from "./components/Toast/ToastContainer.tsx";
import PageNotFound from "./pages/NotFound.tsx";
import OAuthSuccess from "./pages/Auth/OAuth.tsx";
import Loading from "./pages/LoadingScreen/index.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />,
  },
  {
    path: "/login",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/signup",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/editor",
    element: <EditorPage />,
  },
  {
    path: "/oauth-success",
    element: <OAuthSuccess />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

const authRouter = createBrowserRouter([
  {
    path: "/",
    element: <StartPage />,
  },
  {
    path: "/login",
    element: <LoginScreen />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/editor",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/oauth-success",
    element: <OAuthSuccess />,
  },
  {
    path: "*",
    element: <PageNotFound />,
  },
]);

const App = () => {
  const { user, fetchUser, refreshJwt, jwtToken, loading } = useUserStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      await refreshJwt();
      setIsInitializing(false);
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    if (!user && jwtToken) {
      fetchUser();
    }
  }, [jwtToken]);

  if (isInitializing || loading) {
    return (
      <>
        <ToastContainer />
        <Loading />
      </>
    );
  }

  return (
    <>
      <ToastContainer />
      {user ? (
        <RouterProvider router={router} />
      ) : (
        <RouterProvider router={authRouter} />
      )}
    </>
  );
};

export default App;
