import React from 'react';
import type { Screen } from "../types/navigation";
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ScrollableContainer from '../components/ScrollableContainer';

interface AboutScreenProps {
  navigateTo: (screen: Screen) => void;
}

const Feature: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">{icon}</span>
        </div>
        <div>
            <h4 className="font-bold text-gray-800">{title}</h4>
            <p className="text-gray-600 text-sm">{description}</p>
        </div>
    </div>
);


const AboutScreen: React.FC<AboutScreenProps> = ({ navigateTo }) => {
  return (
    <div className="flex flex-col h-full bg-[#FFF9F2]">
      <header className="p-4 flex items-center border-b sticky top-0 bg-[#FFF9F2] z-10">
        <div className="w-1/5">
          <button onClick={() => navigateTo('profile')}>
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <div className="w-3/5 text-center">
          <h1 className="text-xl font-bold text-gray-800">About Us</h1>
        </div>
        <div className="w-1/5"></div>
      </header>

      <ScrollableContainer className="p-6 space-y-8">
        <div className="text-center">
          <h2 className="text-5xl font-extrabold text-orange-500 tracking-wider">
            OFFO
          </h2>
          <p className="text-gray-500 mt-1">(Order Food From Office)</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-lg text-gray-800 mb-3 text-center">Our Mission</h3>
            <p className="text-center text-gray-600 text-sm">
                OFFO (Order Food From Office) is dedicated to revolutionizing the office cafeteria experience. We believe that getting a delicious, timely meal at work should be simple, fast, and hassle-free. Our platform connects you with your office cafeterias, allowing you to skip the queues and enjoy your breaks.
            </p>
        </div>

        <div className="space-y-6">
            <Feature 
                icon="📱"
                title="Order Ahead"
                description="Browse menus from all your office cafes and place orders from your desk or on the go."
            />
             <Feature 
                icon="⚡️"
                title="Skip the Queue"
                description="No more waiting in long lines. We'll notify you when your order is ready for pickup."
            />
             <Feature 
                icon="💳"
                title="Easy Payments"
                description="Pay securely online using your favorite UPI apps. Quick, easy, and cashless."
            />
             <Feature 
                icon="🗓️"
                title="Schedule for Later"
                description="Plan your week's lunches in advance. Order now and pick it up at your convenience."
            />
        </div>

      </ScrollableContainer>

      <footer className="p-4 text-center text-gray-400 text-sm">
        <p>Version 1.0.0</p>
      </footer>
    </div>
  );
};

export default AboutScreen;
