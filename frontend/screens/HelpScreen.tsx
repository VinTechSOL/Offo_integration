import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

// FIX: Defined the missing 'HelpScreenProps' interface.

const faqItems = [



{
  q: "Privacy Policy",
  a: (
    <div className="space-y-3 text-sm text-gray-700">
      <p className="font-semibold">Last Updated: October 2025</p>

      <ol className="list-decimal pl-5 space-y-2">
        <li>
          <strong>Corporate Data Handling</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>We collect corporate email addresses, office locations, and billing details.</li>
            <li>Data is used strictly for cafeteria pre-booking operations.</li>
          </ul>
        </li>

        <li>
          <strong>Use of Professional Information</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>To process meal pre-bookings.</li>
            <li>To manage corporate billing.</li>
            <li>To improve vendor demand planning.</li>
          </ul>
        </li>

        <li>
          <strong>Workplace Integration</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Team orders may be visible to office group members for distribution purposes.</li>
          </ul>
        </li>

        <li>
          <strong>Your Data Control</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>You may request access, export, or deletion of your data at support@offo.co.in.</li>
          </ul>
        </li>
      </ol>
    </div>
  )
},




{
  q: "Terms of Service",
  a: (
    <div className="space-y-3 text-sm text-gray-700">
      <p className="font-semibold">By using the OFFO App, you agree to the following terms:</p>

      <ol className="list-decimal pl-5 space-y-3">
        <li>
          <strong>Order Acceptance and Contract</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>A binding agreement is formed once the Vendor accepts your order.</li>
            <li>You will receive confirmation via push notification, SMS, or email.</li>
            <li>You are responsible for ensuring your contact details are accurate.</li>
          </ul>
        </li>

        <li>
          <strong>Limitation of Liability</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>OFFO operates as a pickup-only platform.</li>
            <li>We are not responsible for travel-related issues or missed pickups.</li>
            <li>Responsibility for food safety transfers to you after handover.</li>
          </ul>
        </li>

        <li>
          <strong>Modification of Terms</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>OFFO reserves the right to update these terms at any time.</li>
            <li>Continued use of the App indicates acceptance of revised terms.</li>
          </ul>
        </li>
      </ol>
    </div>
  )
},

{
  q: "Refund & Cancellations",
  a: (
    <div className="space-y-3 text-sm text-gray-700">
      <ol className="list-decimal pl-5 space-y-3">
        <li>
          <strong>Cancellation Policy</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Orders can be cancelled only before preparation begins.</li>
            <li>No refund will be issued once preparation has started.</li>
            <li>Vendor cancellations qualify for a full refund.</li>
          </ul>
        </li>

        <li>
          <strong>Pickup Responsibilities</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Orders must be collected within the assigned pickup window.</li>
            <li>Uncollected orders after 30 minutes may be disposed of.</li>
            <li>No refund will be provided for missed pickups.</li>
          </ul>
        </li>

        <li>
          <strong>Refund Conditions</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Missing or incorrect items must be reported at pickup.</li>
            <li>Quality issues must be reported within 1 hour with evidence.</li>
            <li>Refund for delays applies only if exceeding 45 minutes.</li>
          </ul>
        </li>
      </ol>
    </div>
  )
},

{
  q: "Pickup Standards",
  a: (
    <div className="space-y-3 text-sm text-gray-700">
      <ol className="list-decimal pl-5 space-y-3">
        <li>
          <strong>Pickup-Only Model</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>OFFO does not provide delivery services.</li>
            <li>Users must collect orders directly from Vendors.</li>
          </ul>
        </li>

        <li>
          <strong>Pickup Locations</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Orders must be collected from the selected Vendor location.</li>
            <li>Locations are typically within your corporate campus.</li>
          </ul>
        </li>

        <li>
          <strong>Holding Times</strong>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>Food quality is guaranteed only within the pickup window.</li>
            <li>Orders uncollected beyond 60 minutes may be discarded.</li>
            <li>No refund will be issued for expired pickup windows.</li>
          </ul>
        </li>
      </ol>
    </div>
  )
},


  // 👤 ACCOUNT
  {
    q: "How do I create an account?",
    a: "Click on the 'Sign Up' option on the login screen and register using your first name ,last name & phone number. Follow the prompts to complete your account setup."
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
    a: "We currently accept PhonePe UPI payments only. Other payment options will be added shortly.Please note that we do not accept credit/debit cards or net banking at this time."
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

const HelpScreen: React.FC = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    const filteredFaqs = faqItems.filter(item => {
      const search = searchTerm.toLowerCase();
      const questionMatch = item.q.toLowerCase().includes(search);
      const answerMatch =
          typeof item.a === "string" &&
          item.a.toLowerCase().includes(search);
        
      return questionMatch || answerMatch;

    });
        
    return (
        <div className="flex flex-col h-full bg-[#FFF9F2]">
            <header className="p-4 flex items-center border-b sticky top-0 bg-[#FFF9F2] z-10">
                <div className="w-1/5">
                    <button onClick={() => navigate('/home')}>
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
                <div className="w-3/5 text-center">
                    <h1 className="text-xl font-bold text-gray-800">Help & Support</h1>
                </div>
                <div className="w-1/5"></div>
            </header>
            
            <main className="flex-grow overflow-y-auto p-4 pb-24">
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
                                    {typeof item.a === "string" ? (
                                        <p>{item.a}</p>
                                    ) : (
                                        item.a
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-white p-4 rounded-lg border border-gray-200 text-center">
                    <h3 className="font-bold text-lg text-gray-800 mb-2">Still need help?</h3>
                    <p className="text-gray-600 mb-4">Contact our support team.</p>
                    <a href="mailto:support@offo.com" className="font-semibold text-orange-600">support@offo.co.in</a>
                    {/* <p className="text-gray-500 text-sm mt-1">or call <a href="tel:+911234567890" className="font-semibold text-orange-600">+91 12345 67890</a></p> */}
                </div>
            </main>

            <BottomNav />
        </div>
    );
};

export default HelpScreen;