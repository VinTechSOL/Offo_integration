import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import ArrowLeftIcon from "../components/icons/ArrowLeftIcon";
import CheckIcon from "@/components/icons/CheckIcon";
import { getMyProfileApi } from "../api/user";
import { getUserContextDetails } from "../api/userContext";



// Icon Components
const UserIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
);
const CreditCardIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 21.75z" />
    </svg>
);
const ReceiptIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);
const BellIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
);
const HelpIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);
const InfoIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
);
const LogoutIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);
const EditIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
    </svg>
);
const ChevronRightIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);
const CloseIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

/* ---------------- TYPES ---------------- */
interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  mobile_number: string;
}

interface UserContext {
  campus_name?: string;
  building_name?: string;
}

/* ---------------- SCREEN ---------------- */
const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [context, setContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------- FETCH PROFILE + CONTEXT -------- */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [userRes, ctxRes] = await Promise.all([
          getMyProfileApi(),
          getUserContextDetails(),
        ]);
        setUser(userRes);
        setContext(ctxRes);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* -------- DERIVED VALUES -------- */
  const fullName = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
  const avatarLetter = fullName.charAt(0).toUpperCase();

  /* -------- MENU CONFIG -------- */
  const generalOptions = [
    { label: "My Account", icon: UserIcon, action: () => navigate("/my-account") },
  
    {
      label: "Order History",
      icon: ReceiptIcon,
      action: () => navigate("/orders"),
    },
  ];

  const moreOptions = [
    { label: "Help & Support", icon: HelpIcon, action: () => navigate("/help") },
    { label: "About Us", icon: InfoIcon, action: () => navigate("/about") },
  ];

  /* ---------------- UI ---------------- */
  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      {/* Header */}
      <header className="p-4 flex items-center border-b">
        <div className="w-1/5">
          <button onClick={() => navigate("/home")}>
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <div className="w-3/5 text-center">
          <h1 className="text-xl font-bold text-gray-800">My Profile</h1>
        </div>
        <div className="w-1/5" />
      </header>

      <main className="flex-grow overflow-y-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-4 rounded-2xl shadow-lg text-white flex items-center">
          {loading ? (
            <div className="animate-pulse flex items-center w-full">
              <div className="w-20 h-20 bg-white/30 rounded-full mr-4" />
              <div className="space-y-2">
                <div className="h-4 w-40 bg-white/30 rounded" />
                <div className="h-3 w-32 bg-white/30 rounded" />
                <div className="h-3 w-48 bg-white/20 rounded" />
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold mr-4">
                {avatarLetter}
              </div>
              <div>
                <h2 className="font-bold text-2xl">{fullName || "User"}</h2>
                <p className="text-sm opacity-90">{user?.mobile_number}</p>
                <p className="text-xs opacity-80 mt-1">
                  {context?.campus_name}
                  {context?.building_name
                    ? ` · ${context.building_name}`
                    : ""}
                </p>
              </div>
            </>
          )}
        </div>

        {/* General */}
        <Section title="General">
          {generalOptions.map((opt, i) => (
            <Row
              key={opt.label}
              icon={opt.icon}
              label={opt.label}
              onClick={opt.action}
              showDivider={i < generalOptions.length - 1}
            />
          ))}
        </Section>

        {/* More */}
        <Section title="More">
          {moreOptions.map((opt, i) => (
            <Row
              key={opt.label}
              icon={opt.icon}
              label={opt.label}
              onClick={opt.action}
              showDivider={i < moreOptions.length - 1}
            />
          ))}
        </Section>

        {/* Logout */}
        <button
          
          onClick={() => navigate("/login")}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold"
        >
          <LogoutIcon className="w-6 h-6" />
          Log Out
        </button>
      </main>

      <BottomNav  />
    </div>
  );
};

/* ---------------- SMALL COMPONENTS ---------------- */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
      {title}
    </h3>
    <div className="bg-white rounded-xl shadow-sm border">{children}</div>
  </div>
);

const Row: React.FC<{
  icon: React.FC<{ className?: string }>;
  label: string;
  onClick: () => void;
  showDivider?: boolean;
}> = ({ icon: Icon, label, onClick, showDivider }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center p-4 ${
      showDivider ? "border-b" : ""
    }`}
  >
    <Icon className="w-6 h-6 text-orange-500 mr-4" />
    <span className="flex-grow font-semibold text-gray-700">{label}</span>
    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
  </button>
);

export default ProfileScreen;
