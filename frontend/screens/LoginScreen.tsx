import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import OTPInput from '../components/OTPInput';
import { sendOtp, verifyOtp,signupInit,signupVerify } from '../api/auth';

interface LoginScreenProps {
  onLoginSuccess: (flow: "signup" | "login") => void;
  
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [errorMessage,setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: number;
    if (isTimerActive && countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0) {
      setIsTimerActive(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, isTimerActive]);

  const isButtonDisabled =
    loading ||
    (activeTab === 'login'
      ? phone.length !== 10
      : phone.length !== 10 || !firstName || !lastName);

  // 🔐 SEND OTP (backend call)
  const handleGetOtp = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      if (activeTab === "signup") {
        await signupInit(phone, firstName, lastName);
      } else {
        // login OTP API (example)
        await sendOtp(phone);
      }

     setShowOtp(true);
     setCountdown(30);
     setIsTimerActive(true);
    } catch (error: any) {
      const status = error?.response?.status;
      const backendMessage =
        error?.response?.data?.detail?.toLowerCase() || "";

        if (status === 429) {
          setErrorMessage("Too many attempts. Please try again later.");
          return;
        }

      // Login Case
      if (activeTab === "login") {
        if (backendMessage.includes("not registered")) {
          setErrorMessage("Mobile number not registered. Please sign up first.");
          return;
        }
      }

      // Signup Case
      if (activeTab === "signup") {
        if (backendMessage.includes("already")) {
          setErrorMessage("Phone number already registered. Please login.");
          return;
        }
      }

      setErrorMessage("Unable to send OTP. Please try again.");

    } finally {
      setLoading(false);
    }
  };


  // 🔁 RESEND OTP (backend call)
  const handleResendOtp = async () => {
    if (!isTimerActive) {
      try {
        setLoading(true);
        await sendOtp(phone);
        setCountdown(30);
        setIsTimerActive(true);
      } catch (error: any) {
        const status = error?.response?.status;

         if (status === 429) {
           setErrorMessage("Too many requests. Please wait before retrying.");
         } else {
           setErrorMessage("Unable to resend OTP.");
         }
      } finally {
        setLoading(false);
      }
    }
  };

  // ✅ VERIFY OTP (backend call)
  const handleVerifyOtp = async (otp: string) => {
    console.log("otp sent from ui",otp);
    try {
      
      setLoading(true);
      let response;

      if (activeTab == "signup"){
        response = await signupVerify(phone,otp);
      } else {
        response = await verifyOtp(phone, otp);
      }
      localStorage.setItem("access_token",response.access_token)
      
      onLoginSuccess(activeTab); // cookie already set by backend
    } catch (error: any) {

      const status = error?.response?.status;

      const backendMessage =
        error?.response?.data?.detail?.toLowerCase() || "";

      if (status === 429) {
        setErrorMessage("Too many failed attempts. Try again later.");
      } else if (backendMessage.includes("invalid")) {
        setErrorMessage("Invalid or expired OTP.");
      } else {
        setErrorMessage("Verification failed. Please try again.");
      }

      setOtpResetKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1B2A]">
      <div className="p-4">
        <button className="text-white" onClick={() => navigate('/onboarding')}>
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-white mb-2 text-center">Welcome!</h1>
          <p className="text-center text-white/80 mb-4 text-base">
            Login or Sign up to continue
          </p>

          <img
            src="../../assets/illustrations/office pic.png"
            alt="Food ordering illustration"
            className="w-48 h-48 mx-auto mb-4 object-contain"
          />

          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                onClick={() => {
                  setActiveTab('login');
                  setShowOtp(false);
                }}
                className={`w-1/2 pb-3 text-center font-semibold text-base ${
                  activeTab === 'login'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-400'
                }`}
              >
                Log In
              </button>

              <button
                onClick={() => {
                  setActiveTab('signup');
                  setShowOtp(false);
                }}
                className={`w-1/2 pb-3 text-center font-semibold text-base ${
                  activeTab === 'signup'
                    ? 'text-orange-500 border-b-2 border-orange-500'
                    : 'text-gray-400'
                }`}
              >
                Sign-up
              </button>
            </div>

            {!showOtp ? (
              <>
                {activeTab === 'signup' && (
                  <>
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-3 bg-gray-100 rounded-lg mb-4"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-3 bg-gray-100 rounded-lg mb-4"
                    />
                  </>
                )}

                <div className="mb-4">
                  <div className="flex items-center w-full p-3 bg-gray-100 rounded-lg">
                    <span className="text-gray-500 font-semibold pr-2 border-r">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => {
                        if (/^\d*$/.test(e.target.value)) {
                          setPhone(e.target.value);
                          setErrorMessage(null);
                        }
                      }}
                      className="w-full bg-transparent pl-2 focus:outline-none"
                    />
                  </div>
                  {errorMessage && (
                   <p className="text-red-500 text-sm mt-2 font-medium">
                     {errorMessage}
                   </p>
                  )}
                </div>

                <button
                  onClick={handleGetOtp}
                  disabled={isButtonDisabled}
                  className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl disabled:bg-gray-300"
                >
                  {loading ? 'Sending...' : 'Get OTP'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  We will send an OTP to +91 {phone || '...'}
                </p>
              </>
            ) : (
              <>
                <p className="text-center text-sm text-gray-500 mb-4">
                  Enter the OTP sent to +91 {phone}
                </p>

                <OTPInput 
                  onVerify={handleVerifyOtp}
                  loading={loading}
                  resetTrigger={otpResetKey}
                />

                <div className="text-center text-sm text-gray-500 mt-4">
                  {isTimerActive ? (
                    <span>Resend OTP in 00:{countdown.toString().padStart(2, '0')}</span>

                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-orange-600 font-medium"
                    >
                      Resend OTP
                    </button>
                  )}
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-sm mt-3 text-center font-medium">
                    {errorMessage}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
