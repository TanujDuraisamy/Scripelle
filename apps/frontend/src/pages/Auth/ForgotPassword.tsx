import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import BackgroundVideo from '../../assets/videos/painting_bg.mp4';
import { forgotPassword } from '../../utils/userUtils';
import { toast } from '../../components/Toast/toastService';
import type { IForgotPasswordRequest } from '../../types/customTypes';

const ForgotPassword = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
  });

  const handleSubmit = async (values: IForgotPasswordRequest) => {
    const res = await forgotPassword(values);

    if (res.type === 'success') {
      setSubmittedEmail(values.email);
      setIsSubmitted(true);
      toast.success('Password reset link sent! Check your email.');
    } else {
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: handleSubmit,
  });

  if (isSubmitted) {
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

              <h2 className="text-3xl font-bold text-white mb-2">Check Your Email</h2>
              <p className="text-gray-200 mb-4">
                We've sent a password reset link to:
              </p>
              <p className="text-white font-medium mb-6">{submittedEmail}</p>

              <div className="bg-[#313131] bg-opacity-20 rounded-2xl p-4 mb-6">
                <p className="text-gray-200 text-sm">
                  If you don't see the email, check your spam folder or try again with a different email address.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setSubmittedEmail('');
                    formik.resetForm();
                  }}
                  className="w-full px-6 py-3 bg-white bg-opacity-20 border border-white border-opacity-30 text-[#364153] rounded-full font-semibold hover:bg-opacity-30 transition-all duration-300"
                >
                  Try Different Email
                </button>

                <Link
                  to="/login"
                  className="block w-full px-6 py-3 bg-white text-gray-700 text-center rounded-full font-semibold hover:bg-gray-100 transition-all duration-300"
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
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-gray-200">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-200 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={formik.isSubmitting}
                className={`w-full px-4 py-3 bg-[#313131] bg-opacity-20 border ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-500'
                    : 'border-gray-300'
                } border-opacity-30 rounded-full text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all`}
                placeholder="Enter your email address"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-400 text-xs mt-2">{formik.errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.values.email}
              className="w-full px-8 py-3 bg-white text-gray-700 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {formik.isSubmitting ? 'Sending Reset Link...' : 'Send Reset Link'}
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

export default ForgotPassword;
