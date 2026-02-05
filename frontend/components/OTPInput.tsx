import React, { useState, useRef, KeyboardEvent } from 'react';

interface OTPInputProps {
  onVerify: (otp: string) => void;
  loading?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ onVerify, loading = false }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (!/^\d$/.test(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling && element.value) {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    if (paste.length === 6 && /^\d+$/.test(paste)) {
      setOtp(paste.split(''));
      inputsRef.current[5]?.focus();
    }
  };

  const otpString = otp.join('');
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
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onFocus={(e) => e.target.select()}
            ref={(el) => { inputsRef.current[index] = el; }}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      <button
        onClick={() => onVerify(otpString)}
        disabled={!isOtpComplete || loading}
        className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors disabled:bg-gray-300"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </div>
  );
};

export default OTPInput;
