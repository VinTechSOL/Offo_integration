import React, { useState } from 'react';
import type { Screen } from "../types/navigation";
import BottomNav from '../components/BottomNav';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

// FIX: Defined the missing 'HelpScreenProps' interface.
interface HelpScreenProps {
    navigateTo: (screen: Screen) => void;
}

const faqItems = [
    { q: "How do I place an order?", a: "Navigate to the 'Explore' tab, browse through cafes and food items, add items to your cart, and proceed to checkout." },
    { q: "Can I schedule an order for a future date?", a: "Yes, in your cart, you can choose the 'Schedule Order' option to select a future date and time for your pickup." },
    { q: "What payment methods are accepted?", a: "We accept various payment methods including PhonePe, Google Pay, and Paytm. You can select your preferred method at checkout." },
    { q: "How can I track my order?", a: "Once your order is placed, you can track its status in the 'My Orders' tab under the 'Ongoing' section." },
    { q: "Is there a cancellation policy?", a: "Orders can be cancelled up to 5 minutes after they are placed. After this period, cancellation is not possible as the cafe will have started preparing your meal." },
    { q: "How do I report an issue with my order?", a: "If you have any issues with your order, please contact our support team immediately through the contact details provided on this page." },
];

const HelpScreen: React.FC<HelpScreenProps> = ({ navigateTo }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    const filteredFaqs = faqItems.filter(item => 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#FFF9F2]">
            <header className="p-4 flex items-center border-b sticky top-0 bg-[#FFF9F2] z-10">
                <div className="w-1/5">
                    <button onClick={() => navigateTo('home')}>
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
                <div className="w-3/5 text-center">
                    <h1 className="text-xl font-bold text-gray-800">Help & Support</h1>
                </div>
                <div className="w-1/5"></div>
            </header>
            
            <main className="flex-grow overflow-y-auto p-4">
                <div className="mb-6">
                    <input 
                        type="text"
                        placeholder="Search for help..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                    />
                </div>

                <div className="space-y-3">
                    {filteredFaqs.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <button 
                                onClick={() => toggleFaq(index)}
                                className="w-full flex justify-between items-center text-left p-4 font-semibold text-gray-800"
                            >
                                <span>{item.q}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 transition-transform ${openIndex === index ? 'transform rotate-180' : ''}`}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>
                            {openIndex === index && (
                                <div className="p-4 pt-0 text-gray-600">
                                    <p>{item.a}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Still need help?</h3>
                    <p className="text-gray-600 mb-4">Contact our support team.</p>
                    <a href="mailto:support@offo.com" className="font-semibold text-orange-600">support@offo.com</a>
                    <p className="text-gray-500 text-sm mt-1">or call <a href="tel:+911234567890" className="font-semibold text-orange-600">+91 12345 67890</a></p>
                </div>
            </main>

            <BottomNav activeScreen="help" navigateTo={navigateTo} />
        </div>
    );
};

export default HelpScreen;