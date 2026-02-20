import React, { useState } from 'react';
import type { Screen } from "../types/navigation";
import BottomNav from '../components/BottomNav';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

// FIX: Defined the missing 'HelpScreenProps' interface.
interface HelpScreenProps {
    navigateTo: (screen: Screen) => void;
}

const faqItems = [

  // 🔒 POLICIES
{
  q: "Privacy Policy",
  a: `Privacy Policy
Last Updated: October 2025

1. Corporate Data Handling
At OFFO, we respect the privacy of our individual users and our corporate partners. We collect office addresses, corporate email domains, and billing information strictly for the fulfillment of cafeteria pre-booking services.

2. Use of Professional Information
We use your data to streamline meal pre-booking, manage corporate billing accounts, and improve vendor demand planning based on order history.

3. Workplace Integration
When using team-ordering features, your name and selected items may be visible to other members of your designated office group to facilitate smooth distribution.

4. Your Data Control
You may request access, export, or deletion of your workplace dining history at any time by contacting support@offo.co.in.`
},

  {
  q: "Terms of Service",
  a: `Terms of Service
By using the OFFO App, you agree to enter into a legally binding agreement governed by the following terms and conditions.

1. Order Acceptance and Contract
Once an order is placed through the App and accepted by the Vendor, a binding contract is formed between you and the Vendor. You will receive a confirmation notification via push notification, SMS, or email specifying the pickup time. It is your responsibility to ensure that your contact details are accurate and up to date.

2. Limitation of Liability
OFFO operates as a pickup-only ordering platform and does not provide delivery services. OFFO is not responsible for issues arising from your travel to the Vendor or failure to collect the order within the pickup window. Once the order has been handed over to you, responsibility for maintaining food temperature and safety transfers to you.

3. Modification of Terms
OFFO reserves the right to update these terms at any time. Continued use of the platform after changes are published constitutes acceptance of the revised terms.`
},

  {
  q: "Refunds & Cancellations",
  a: `Refunds & Cancellations

1. Cancellation Policy
Cancellations are permitted only before food preparation begins. Once preparation has started, no cancellation or refund will be issued. OFFO or the Vendor may cancel orders due to operational issues, in which case a full refund will be processed.

2. Pickup Responsibilities
Users must collect orders within the designated pickup window. Orders not collected within 30 minutes may be disposed of, and no refund will be provided.

3. Refund Policy
Missing or incorrect items must be reported immediately at pickup. Quality concerns must be raised within 1 hour with supporting evidence. Delays qualify for refund only if exceeding 45 minutes beyond estimated pickup time.`




},

{
  q: "Pickup Standards",
  a: `Pickup Standards

1. Pickup-Only Model
OFFO operates exclusively as a pickup-only platform. No delivery services are provided. Users are required to collect their orders directly from the Vendor.

2. Pickup Locations
Orders must be collected from the selected Vendor location within your campus or office premises.

3. Holding Times
Food quality is guaranteed only within the assigned pickup window. Orders uncollected beyond 60 minutes may be disposed of without refund.`
},

  // 👤 ACCOUNT
  {
    q: "How do I create an account?",
    a: "Click on the 'Sign Up' option on the login screen and register using your corporate email address. Follow the prompts to complete your account setup."
  },

  // 🛒 ORDERS
  {
    q: "How do I place an order?",
    a: "Go to the Explore tab, select your cafeteria, choose your items, confirm your pickup time, and complete your payment."
  },

  {
    q: "Can I schedule an order for a future date?",
    a: "Yes. You can pre-book meals for a selected future date and pickup slot directly from your cart."
  },

  {
    q: "How can I track my order?",
    a: "After placing your order, you can track its status in the 'My Orders' section."
  },

  // 💳 PAYMENTS
  {
    q: "What payment methods are accepted?",
    a: "We support  PhonePe and corporate billing (if enabled by your organization)."
  },

  // ❌ CANCELLATION
  {
    q: "Can I cancel my order?",
    a: "Orders can only be cancelled before food preparation begins. Once preparation starts, cancellation is not permitted."
  },

  // 🛟 SUPPORT
  {
    q: "How do I report an issue with my order?",
    a: "If you face any issue with your order, please contact our support team immediately using the contact details provided in the Help & Support section."
  }

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