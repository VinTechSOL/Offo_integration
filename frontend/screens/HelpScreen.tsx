import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const faqItems = [
  // 📋 PRIVACY POLICY - Full Version
  {
    q: "Privacy Policy",
    a: (
      <div className="space-y-3 text-sm text-gray-700">
        <p className="font-semibold">Last Updated: June 2026</p>

        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <strong>1. Corporate Data Handling</strong>
            <p className="mt-1">At OFFO, we respect the privacy of our individual users and our corporate partners. We collect office addresses, corporate email domains, and billing information strictly for the fulfillment of culinary services.</p>
          </li>

          <li>
            <strong>2. Use of Professional Information</strong>
            <p className="mt-1">We use your data to streamline the delivery process, manage corporate billing accounts, and provide personalized nutritional recommendations based on your order history.</p>
          </li>

          <li>
            <strong>3. Workplace Integration</strong>
            <p className="mt-1">When using our team-ordering features, your name and order selection may be visible to other members of your designated office group to facilitate bulk distribution.</p>
          </li>

          <li>
            <strong>4. Data Security and Third-Party Sharing</strong>
            <p className="mt-1">We implement industry-standard security measures, including encryption and secure payment gateways, to protect your corporate and billing data. We do not sell your information. We only share data with trusted third-party partners—such as delivery logistics, cloud hosting, and payment processors—strictly to the extent necessary to fulfill our services.</p>
          </li>

          <li>
            <strong>5. Cookies and Tracking</strong>
            <p className="mt-1">Our platform utilizes cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze platform performance to improve your ordering experience. You can manage your cookie preferences through your browser settings.</p>
          </li>

          <li>
            <strong>6. Data Retention and Control</strong>
            <p className="mt-1">We retain your personal and professional data only for as long as your corporate account remains active, or as required to comply with our legal, tax, and regulatory obligations. However, you retain full control over your data; you may request a complete export or deletion of your workplace dining history at any time by contacting support@offo.co.in.</p>
          </li>

          <li>
            <strong>7. Legal Compliance and Updates</strong>
            <p className="mt-1">We operate in compliance with applicable data protection laws, including the Digital Personal Data Protection (DPDP) Act. We may disclose data if required by law enforcement or regulatory authorities. We reserve the right to update this policy periodically, and we will notify you of any material changes via email or platform notification.</p>
          </li>
        </ol>
      </div>
    )
  },

  // 📋 TERMS OF SERVICE - Full Version
  {
    q: "Terms of Service",
    a: (
      <div className="space-y-3 text-sm text-gray-700">
        <p className="font-semibold">Last Updated: June 2026</p>
        <p className="mb-3">By accessing or using the OFFO application ("App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>

        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <strong>1. Order Acceptance and Contract</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Finality:</strong> Once an order is placed through the App and accepted by the respective food partner ("Vendor"), a binding contract is formed between you and the Vendor.</li>
              <li><strong>Notification:</strong> You will receive a confirmation notification (push notification, SMS, or email) indicating that the order has been accepted and providing an estimated pickup time. It is your sole responsibility to ensure your contact details are correct and notifications are enabled.</li>
            </ul>
          </li>

          <li>
            <strong>2. Payments, Cancellations, and Refunds</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Payment:</strong> All payments must be settled through the App's integrated payment gateways at the time of ordering.</li>
              <li><strong>Cancellations:</strong> Once an order is accepted by the Vendor, it cannot be canceled or modified by the user.</li>
              <li><strong>No-Show Policy:</strong> If you fail to pick up your order within the Vendor's designated holding window, the order will be discarded, and no refunds or credits will be issued.</li>
              <li><strong>Refunds:</strong> Refund requests for incorrect or missing items must be reported to support@offo.co.in within 2 hours of the scheduled pickup time, subject to verification.</li>
            </ul>
          </li>

          <li>
            <strong>3. Limitation of Liability and Food Safety</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Platform Role:</strong> You acknowledge that OFFO acts solely as a technology platform connecting users with third-party Vendors. OFFO is not responsible for any incidents, delays, or issues arising from your travel to or from the Vendor.</li>
              <li><strong>Food Quality & Allergens:</strong> The preparing Vendor is solely responsible for food quality, preparation, and accurate allergen labeling. OFFO assumes no liability for foodborne illnesses, allergic reactions, or dietary inaccuracies.</li>
              <li><strong>Transfer of Safety:</strong> Once the order is handed over to you, full responsibility for maintaining food hygiene, appropriate temperature, and safety shifts entirely to you.</li>
            </ul>
          </li>

          <li>
            <strong>4. User Account Responsibility</strong>
            <p className="mt-1">You are responsible for maintaining the confidentiality of your account credentials. Any activity, orders, or charges incurred under your account will be deemed your sole responsibility.</p>
          </li>

          <li>
            <strong>5. Modification of Terms</strong>
            <p className="mt-1">OFFO reserves the right to modify these terms at any time. We will notify you of material changes via the App or email. Your continued use of the platform after such updates constitutes explicit acceptance of the revised terms.</p>
          </li>
        </ol>
      </div>
    )
  },

  // 📋 CANCELLATION & REFUND POLICY - Full Version
  {
    q: "Cancellation & Refund Policy",
    a: (
      <div className="space-y-3 text-sm text-gray-700">
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <strong>1. Cancellation Policy</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>User Cancellations:</strong> Because meals are perishable and prepared to order, cancellations are generally not permitted once an order is placed. The order is transmitted to the Vendor's kitchen immediately. If the Vendor has already accepted the order or begun preparation, the order cannot be canceled, and no refund will be issued.</li>
              <li><strong>Vendor or Platform Cancellations:</strong> OFFO or the Vendor reserves the right to cancel an order at any time due to unexpected ingredient shortages, kitchen capacity limits, or technical errors. In the event of a platform or Vendor-initiated cancellation, a 100% refund will be automatically processed to your original payment method.</li>
            </ul>
          </li>

          <li>
            <strong>2. Pickup Responsibilities</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>The Pickup Window:</strong> You are required to arrive at the Vendor's location within the estimated pickup window displayed in the App.</li>
              <li><strong>Failed Pickups (No-Shows):</strong> If you fail to collect your order within 30 minutes of the scheduled pickup time:
                <ol className="list-decimal pl-5 mt-1 space-y-1">
                  <li>The Vendor will dispose of the food to comply with health and safety regulations or serve it to anybody else.</li>
                  <li>You will be charged the full amount of the order to cover ingredients and preparation costs.</li>
                  <li>No refunds, partial refunds, or account credits will be issued for uncollected orders.</li>
                </ol>
              </li>
              <li><strong>Verification:</strong> To secure your order, you must present your in-app order confirmation screen or provide the unique Order ID to the Vendor upon arrival.</li>
            </ul>
          </li>

          <li>
            <strong>3. Refund Policy</strong>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li><strong>Missing or Incorrect Items:</strong> Please check your order before leaving the Vendor's premises. If items are missing or incorrect, notify the Vendor immediately on-site so they can correct it. If the Vendor cannot resolve it, take a photo and contact OFFO support within 1 hour.</li>
              <li><strong>Quality Disputes:</strong> For quality concerns discovered post-pickup, you must contact OFFO Customer Support within 1 hour of the scheduled pickup time. Your request must include clear photographic evidence of the food issue.</li>
              <li><strong>Delayed Preparation:</strong> Kitchen speeds vary during peak hours. Refunds or compensation for delayed food will not be issued unless the preparation delay exceeds 45 minutes past the estimated pickup time.</li>
              <li><strong>Processing Timelines:</strong> Approved refunds will be credited back to your original payment method. Depending on your financial institution, please allow 5 to 7 business days for the funds to reflect in your account.</li>
            </ul>
          </li>
        </ol>

        {/* Eligibility Table */}
        <div className="mt-6 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
          <div className="p-4 bg-gray-100 border-b border-gray-200">
            <h4 className="font-bold text-gray-800">Eligibility Overview</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-4 py-3">Scenario</th>
                  <th className="px-4 py-3">Refund Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Vendor cancels order</td>
                  <td className="px-4 py-3 text-green-600 font-medium">Full Refund</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">User cancels before prep starts</td>
                  <td className="px-4 py-3 text-green-600 font-medium">Full Refund (minus small admin fee)</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">User cancels after preparation starts</td>
                  <td className="px-4 py-3 text-red-600 font-medium">No Refund</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">User fails to pick up order</td>
                  <td className="px-4 py-3 text-red-600 font-medium">No Refund</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Incorrect item/Missing item</td>
                  <td className="px-4 py-3 text-orange-600 font-medium">Partial/Full Refund or Replacement</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  },

  // 📋 PICKUP STANDARDS
  {
    q: "Pickup Standards",
    a: (
      <div className="space-y-3 text-sm text-gray-700">
        <ol className="list-decimal pl-5 space-y-3">
          <li>
            <strong>1. The Pickup-Only Model</strong>
            <p className="mt-1">OFFO is a pickup-only platform. This allows us to ensure you get your food the moment it's ready, at the lowest possible cost.</p>
          </li>

          <li>
            <strong>2. Pickup Locations</strong>
            <p className="mt-1">Orders must be collected from the specific Vendor location selected at checkout. These are typically located within your campus or office building complex.</p>
          </li>

          <li>
            <strong>3. Holding Times</strong>
            <p className="mt-1">While Vendors try to accommodate delays, food quality is only guaranteed if collected within the provided window. Items held for more than 60 minutes are subject to disposal without refund.</p>
          </li>
        </ol>
      </div>
    )
  },

  // 📋 DELIVERY & PICKUP FAQ
  {
    q: "Does OFFO deliver to my house?",
    a: "No, OFFO is a pickup-only platform. You place your order securely through the app and collect it directly from the Vendor, skipping the delivery fees and long wait times."
  },
  {
    q: "How do I know when to head to the restaurant?",
    a: "You will receive a 'Ready for Pickup' notification on your phone once the Vendor has finished preparing your order. We highly recommend heading over as soon as you get this alert to ensure your food is fresh and hot."
  },
  {
    q: "What do I need to bring to collect my order?",
    a: "Just your phone! Simply show the staff at the Vendor's location your unique Order ID or the 'Order Ready' screen inside the app."
  },

  // 📋 CANCELLATIONS & TIMING FAQ
  {
    q: "Can I cancel my order?",
    a: "Because meals are perishable and prepared fresh to order, cancellations are generally not permitted once placed. Your order is sent to the kitchen instantly. If the Vendor has already accepted the order or begun preparation, it cannot be cancelled or refunded."
  },
  {
    q: "I'm running late. Will they hold my food?",
    a: "Vendors will hold your food for up to 30 minutes past your scheduled pickup time. However, food quality (temperature and texture) cannot be guaranteed if collected late. After 30 minutes, the Vendor may dispose of the food for health and safety reasons, and you will still be charged in full."
  },
  {
    q: "Can I change my pickup time after ordering?",
    a: "Pickup times are automated estimates based on the kitchen's live workload and cannot be manually changed. However, your food will be waiting safely for you anytime within 30 minutes after you receive your 'Ready' notification."
  },

  // 📋 ISSUES & REFUNDS FAQ
  {
    q: "What if the Vendor is closed when I arrive?",
    a: "While our system syncs with Vendor operating hours to ensure this doesn't happen, anomalies can occur. If the store is closed, please take a quick photo of the storefront and contact our support team via the app immediately. We will verify the issue and issue a 100% refund."
  },
  {
    q: "Something is missing or incorrect in my order. What should I do?",
    a: "Please check your items before leaving the Vendor's counter. If anything is missing, notify the staff immediately so they can fix it on the spot. If you only notice an issue after leaving, take a photo of what you received and contact support through the app within 1 hour of your pickup time."
  },
  {
    q: "The food quality wasn't what I expected. Can I get a refund?",
    a: "Because OFFO operates the ordering platform and not the kitchen, quality concerns should be raised directly with the Vendor on-site. If you are unable to reach a resolution with them, please contact our support team through the app within 1 hour with details and photographic evidence for our review."
  },
  {
    q: "Why was I charged even though I didn't pick up my food?",
    a: "Because the Vendor dedicated ingredients, time, and labor to prepare your specific meal, they must be compensated. Per our Terms of Service, uncollected orders are non-refundable."
  },

  // 📋 PAYMENTS FAQ
  {
    q: "Can I pay with cash at the shop?",
    a: "No. To ensure your order is sent to the kitchen instantly and your pickup is as fast and seamless as possible; all payments must be processed securely through the app using UPI only."
  },

  // 👤 ACCOUNT (Existing)
  {
    q: "How do I create an account?",
    a: "Click on the 'Sign Up' option on the login screen and register using your first name, last name & phone number. Follow the prompts to complete your account setup."
  },

  // 🛒 ORDERS (Existing)
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

  // 💳 PAYMENTS (Existing - Updated)
  {
    q: "What payment methods are accepted?",
    a: "We currently accept UPI payments only through the app's integrated payment gateway. Other payment options will be added shortly. Please note that we do not accept cash, credit/debit cards, or net banking at this time."
  },

  // 🛟 SUPPORT (Existing)
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
            className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((item, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex justify-between items-center text-left p-4 font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm">{item.q}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className={`w-5 h-5 transition-transform flex-shrink-0 ml-2 ${openIndex === index ? 'transform rotate-180' : ''}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="p-4 pt-0 text-gray-600 border-t border-gray-100">
                  {typeof item.a === "string" ? (
                    <p className="text-sm">{item.a}</p>
                  ) : (
                    item.a
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No results found for "{searchTerm}"</p>
          </div>
        )}

        <div className="mt-8 bg-white p-4 rounded-lg border border-gray-200 text-center shadow-sm">
          <h3 className="font-bold text-lg text-gray-800 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">Contact our support team.</p>
          <a href="mailto:support@offo.co.in" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors">
            support@offo.co.in
          </a>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default HelpScreen;