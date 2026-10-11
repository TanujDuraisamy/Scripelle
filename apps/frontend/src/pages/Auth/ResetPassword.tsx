import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import BackgroundVideo from '../../assets/videos/painting_bg.mp4';
import { resetPassword } from '../../utils/userUtils';
import { toast } from '../../components/Toast/toastService';
import type { IResetPasswordRequest } from '../../types/customTypes';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast.error('Invalid reset link. Please request a new password reset.');
      navigate('/forgot-password');
      return;
    }
    setToken(tokenFromUrl);
  }, [searchParams, navigate]);

  const validationSchema = Yup.object({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain uppercase, lowercase, number, and special character'
      )
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Confirm password is required'),
  });

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (!token) {
      toast.error('Invalid token. Please request a new password reset.');
      return;
    }

    const resetData: IResetPasswordRequest = {
      token,
      newPassword: values.password,
    };

    const res = await resetPassword(resetData);

    if (res.type === 'success') {
      setIsSuccess(true);
      toast.success('Password reset successful! You can now sign in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      toast.error('Failed to reset password. The link may have expired or is invalid.');
    }
  };

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  if (!token && !isSuccess) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
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

        <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
          <div className="w-full max-w-md bg-[#313131] bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">Invalid Link</h2>
              <p className="text-gray-200 mb-6">
                This password reset link is invalid or has expired.
              </p>

              <div className="space-y-3">
                <Link
                  to="/forgot-password"
                  className="block w-full px-6 py-3 bg-white text-gray-700 text-center rounded-full font-semibold hover:bg-gray-100 transition-all duration-300"
                >
                  Request New Reset Link
                </Link>

                <Link
                  to="/login"
                  className="block w-full px-6 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 text-white text-center rounded-full font-semibold hover:bg-opacity-30 transition-all duration-300"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="relative w-full h-screen overflow-hidden">
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

        <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
          <div className="w-full max-w-md bg-[#313131] bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-gray-200 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>

              <div className="bg-[#313131] bg-opacity-20 rounded-2xl p-4 mb-6">
                <p className="text-gray-200 text-sm">
                  Redirecting to sign in page in a few seconds...
                </p>
              </div>

              <Link
                to="/login"
                className="block w-full px-6 py-3 bg-white text-gray-700 text-center rounded-full font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                Continue to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
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

      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        <div className="w-full max-w-md bg-[#313131] bg-opacity-10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-gray-200">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className={`w-full px-4 py-3 bg-[#313131] bg-opacity-20 border ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500'
                    : 'border-gray-300'
                } border-opacity-30 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all`}
                placeholder="Enter your new password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-400 text-xs mt-2">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className={`w-full px-4 py-3 bg-[#313131] bg-opacity-20 border ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                } border-opacity-30 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all`}
                placeholder="Confirm your new password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-2">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.values.password || !formik.values.confirmPassword}
              className="w-full px-8 py-3 bg-white text-gray-700 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {formik.isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-200">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-white font-semibold hover:underline"
              >
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
