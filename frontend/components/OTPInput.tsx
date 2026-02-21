import React, { useState, useRef, KeyboardEvent, useEffect } from "react";

interface OTPInputProps {
  onVerify: (otp: string) => void;
  loading?: boolean;
  resetTrigger?: number; // 👈 used to reset externally
}

const OTPInput: React.FC<OTPInputProps> = ({
  onVerify,
  loading = false,
  resetTrigger,
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // ✅ Reset OTP when resetTrigger changes
  useEffect(() => {
    setOtp(new Array(6).fill(""));
    inputsRef.current[0]?.focus();
  }, [resetTrigger]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;

    // Allow empty (for delete)
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move forward if digit entered
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        // Clear current
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        // Move back
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text");

    if (paste.length === 6 && /^\d+$/.test(paste)) {
      const newOtp = paste.split("");
      setOtp(newOtp);
      inputsRef.current[5]?.focus();
    }
  };

  const otpString = otp.join("");
  const isOtpComplete = otpString.length === 6;

  return (
    <div className="animate-fade-in-slow mt-6">
      <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
        {otp.map((value, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={value}
            className="w-12 h-14 text-center text-2xl font-bold bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
            ref={(el) => {
              inputsRef.current[index] = el;
            }}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <button
        onClick={() => onVerify(otpString)}
        disabled={!isOtpComplete || loading}
        className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors disabled:bg-gray-300"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>
    </div>
  );
};

export default OTPInput;