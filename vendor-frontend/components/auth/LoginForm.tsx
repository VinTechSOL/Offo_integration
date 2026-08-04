import React, { useState, useEffect } from "react";
import { LockClosedIcon, UserIcon } from "../icons";
import { staffLogin, sendResetOTP, verifyResetOTP, resetStaffPassword } from "../../apis/auth";
import { useVendor } from "@/context/VendorContext";

interface LoginFormProps {
  onLoginSuccess: () => void;
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onForgotPassword,
}) => {
  const { refreshProfile } = useVendor();
  
  // Login States
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Forgot Password / OTP States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Timer for OTP resend
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  // Auto-hide success/error messages
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => {
        setErrorMessage("");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  // Handle Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await staffLogin({
        username: username.trim(),
        password,
      });

      await refreshProfile();
      onLoginSuccess();
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else if (err.code === "ERR_NETWORK") {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Validate OTP
  const validateOTP = (otpCode: string) => {
    const otpRegex = /^[0-9]{6}$/;
    return otpRegex.test(otpCode);
  };

  // Validate password
  const validatePassword = (pass: string) => {
    return pass.length >= 6;
  };

  // Send OTP
  const handleSendOTP = async () => {
    setErrorMessage("");
    setSuccess("");

    if (!phoneNumber) {
      setErrorMessage("Please enter your phone number");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setErrorMessage("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      await sendResetOTP({
        mobile_number: phoneNumber,
      });

      setOtpSent(true);
      setCurrentStep(2);
      setSuccess('✅ OTP sent successfully to your phone number!');
      setTimer(60);
      setIsResendDisabled(true);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail ?? 'Failed to send OTP. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async () => {
    setErrorMessage("");
    setSuccess("");

    if (!otp) {
      setErrorMessage("Please enter the OTP");
      return;
    }

    if (!validateOTP(otp)) {
      setErrorMessage("Please enter a valid 6-digit OTP");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = await verifyResetOTP({
        mobile_number: phoneNumber,
        otp,
      });

      setResetToken(data.reset_token);

      setOtpVerified(true);
      setCurrentStep(3);

      setSuccess('✅ OTP verified successfully! Please set your new password.');

      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.detail ?? 'Invalid OTP. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccess("");
    setPasswordResetSuccess(false);

    if (!newPassword) {
      setErrorMessage("Please enter a new password");
      return;
    }

    if (!validatePassword(newPassword)) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await resetStaffPassword({
        reset_token: resetToken,
        new_password: newPassword,
      });

      setPasswordResetSuccess(true);
      setNewPassword("");
      setConfirmPassword("");

      setSuccess('✅ Password reset successfully! Redirecting to login...');

      setResetToken('');

      setTimeout(() => {
        handleBackToLogin();
      }, 3000);
    } catch (err: any) {
      if (err.code === 'ERR_NETWORK') {
        setErrorMessage('No internet connection.');
      } else {
        setErrorMessage(err.response?.data?.detail ?? 'Something went wrong.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOTP = () => {
    if (!isResendDisabled) {
      setOtp("");
      handleSendOTP();
    }
  };

  // Reset forgot password state
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setOtpVerified(false);
    setPhoneNumber("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setSuccess("");
    setErrorMessage("");
    setTimer(0);
    setResetToken("");
    setPasswordResetSuccess(false);
    setCurrentStep(1);
  };

  // Go back to previous step
  const handleGoBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      setOtpSent(false);
      setOtp('');
      setSuccess('');
      setErrorMessage('');

      //reset resend state
      setTimer(0);
      setIsResendDisabled(false);
    } else if (currentStep === 3) {
      setCurrentStep(2);
      setOtpVerified(false);

      // Clear the verified reset token
      setResetToken('');

      setNewPassword('');
      setConfirmPassword('');
      setSuccess('');
      setErrorMessage('');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg animate-fadeIn w-full max-w-md">
      {!showForgotPassword ? (
        // Login Form
        <>
          <h2 className="text-2xl font-bold text-center text-text-primary mb-1">
            Vendor Login
          </h2>
          <p className="text-center text-text-secondary mb-6">
            Login to manage orders & menu
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                <UserIcon className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                <LockClosedIcon className="w-5 h-5" />
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 font-medium text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-offo-orange text-white font-bold py-2 px-4 rounded-md hover:bg-offo-orange-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => {
                  handleBackToLogin();
                  setShowForgotPassword(true);
                }}
                className="text-sm text-offo-orange hover:text-offo-orange-dark transition-colors font-medium"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </>
      ) : (
        // Forgot Password / OTP Section
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary">
              {passwordResetSuccess
                ? 'Password Reset Successful!'
                : currentStep === 3
                ? 'Set New Password'
                : 'Reset Password'}
            </h2>
            <p className="text-sm text-text-secondary mt-2">
              {passwordResetSuccess
                ? 'Your password has been reset successfully.'
                : currentStep === 3
                ? 'Enter your new password below'
                : currentStep === 2
                ? 'Enter the OTP sent to your phone'
                : 'Enter your registered phone number'}
            </p>
          </div>

          {/* Progress Steps */}
          {!passwordResetSuccess && (
            <div className="flex justify-center items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 1
                    ? 'bg-offo-orange text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                1
              </div>
              <div
                className={`w-12 h-0.5 ${
                  currentStep >= 2 ? 'bg-offo-orange' : 'bg-gray-200'
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 2
                    ? 'bg-offo-orange text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                2
              </div>
              <div
                className={`w-12 h-0.5 ${
                  currentStep >= 3 ? 'bg-offo-orange' : 'bg-gray-200'
                }`}
              ></div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep >= 3
                    ? 'bg-offo-orange text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                3
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <span className="text-green-600 text-lg">✅</span>
              <span>{success}</span>
            </div>
          )}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <span className="text-red-600 text-lg">❌</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Step 1: Phone Number */}
          {currentStep === 1 && !passwordResetSuccess && (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <UserIcon className="w-5 h-5" />
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="Enter 10-digit phone number"
                  className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
                  maxLength={10}
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={isSubmitting}
                className="w-full bg-offo-orange text-white font-bold py-2 px-4 rounded-md hover:bg-offo-orange-dark transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>
            </>
          )}

          {/* Step 2: OTP Verification */}
          {currentStep === 2 && !passwordResetSuccess && (
            <>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <LockClosedIcon className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
                  maxLength={6}
                />
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-text-secondary">
                  {timer > 0 ? `Resend in ${timer}s` : 'OTP sent to your phone'}
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResendDisabled || isSubmitting}
                  className={`text-sm font-medium ${
                    isResendDisabled || isSubmitting
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-offo-orange hover:text-offo-orange-dark'
                  } transition-colors`}
                >
                  Resend OTP
                </button>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={isSubmitting}
                className="w-full bg-offo-orange text-white font-bold py-2 px-4 rounded-md hover:bg-offo-orange-dark transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}

          {/* Step 3: New Password */}
          {currentStep === 3 && !passwordResetSuccess && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <LockClosedIcon className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="New password (min 6 characters)"
                  className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
                  required
                />
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
                  <LockClosedIcon className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange"
                  required
                />
              </div>

              {newPassword &&
                confirmPassword &&
                newPassword === confirmPassword && (
                  <p className="text-xs text-green-600 font-medium">
                    ✅ Passwords match
                  </p>
                )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-offo-orange text-white font-bold py-2 px-4 rounded-md hover:bg-offo-orange-dark transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* Success message after password reset */}
          {passwordResetSuccess && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <p className="text-sm text-gray-600">
                Your password has been reset successfully. You will be
                redirected to login shortly.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          {!passwordResetSuccess && (
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleGoBack}
                  className="flex-1 text-text-secondary text-sm hover:text-text-primary transition-colors font-medium py-2 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={handleBackToLogin}
                className={`${
                  currentStep > 1 ? 'flex-1' : 'w-full'
                } text-text-secondary text-sm hover:text-text-primary transition-colors font-medium py-2 border border-gray-200 rounded-md hover:bg-gray-50`}
              >
                ← Back to Login
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoginForm;