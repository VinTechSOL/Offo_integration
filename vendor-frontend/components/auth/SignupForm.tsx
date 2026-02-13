import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, BuildingOfficeIcon, LockClosedIcon, MailIcon, PhoneIcon, UserIcon, ClockIcon, ChevronDownIcon } from '../icons';

interface SignupFormProps {
  onSignupSuccess: () => void;
  switchToLogin: () => void;
}

const STEPS = [
    { number: 1, title: 'Account Details' },
    { number: 2, title: 'Location' },
    { number: 3, title: 'Business Info' },
    // { number: 4, title: 'Bank Details' },
    
];

const ProgressBar: React.FC<{ currentStep: number }> = ({ currentStep }) => (
    <div className="flex items-center mb-6">
        {STEPS.map((step, index) => (
            <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${currentStep >= step.number ? 'bg-offo-orange text-white' : 'bg-medium-gray text-text-secondary'}`}>
                        {step.number}
                    </div>
                    <p className={`text-xs mt-1 text-center ${currentStep >= step.number ? 'text-offo-orange font-semibold' : 'text-text-secondary'}`}>{step.title}</p>
                </div>
                {index < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 ${currentStep > step.number ? 'bg-offo-orange' : 'bg-medium-gray'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);


const InputField: React.FC<{ icon: React.ReactNode; type: string; placeholder: string; id: string; required?: boolean }> = ({ icon, type, placeholder, id, required = true }) => (
    <div className="relative">
        <label htmlFor={id} className="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900">{placeholder}</label>
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary">
            {icon}
        </span>
        <input 
            type={type} 
            id={id}
            className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-md focus:outline-none focus:ring-2 focus:ring-offo-orange focus:border-transparent" 
            required={required}
        />
    </div>
);

const SelectField: React.FC<{ label: string; id: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode; required?: boolean; disabled?: boolean }> = ({ label, id, value, onChange, children, required = true, disabled = false }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
        <div className="relative">
            <select
                id={id}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-3 border border-medium-gray rounded-lg focus:outline-none focus:ring-2 focus:ring-offo-orange focus:border-transparent bg-white appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed pr-10"
                required={required}
                disabled={disabled}
            >
                {children}
            </select>
            <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
    </div>
);


// Mock data for location dropdowns
const locationsData: Record<string, Record<string, Record<string, string[]>>> = {
    'Bangalore': {
        'Amazon': {
            'Building 1': ['Floor 1', 'Floor 2', 'Floor 3'],
            'Building 2': ['Floor 1', 'Floor 4', 'Floor 5'],
        },
        'Google': {
            'Tech Park A': ['Floor 5', 'Floor 6', 'Floor 7'],
            'Tech Park B': ['Floor 8', 'Floor 9'],
        },
    },
    'Hyderabad': {
        'Microsoft': {
            'Campus 1': ['Ground Floor', 'First Floor', 'Second Floor'],
            'Campus 2': ['Block A', 'Block B'],
        },
        'Infosys': {
            'SEZ Campus': ['Building 10', 'Building 11'],
        },
    },
    'Pune': {
        'Wipro': {
            'Hinjewadi Phase 1': ['Tower 1', 'Tower 2'],
        },
    },
};


export const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess, switchToLogin }) => {
  const [step, setStep] = useState(1);

  // Location state
  const [city, setCity] = useState('');
  const [company, setCompany] = useState('');
  const [building, setBuilding] = useState('');
  const [locationDetected, setLocationDetected] = useState(false);

  const handleCitySelect = (selectedCity: string) => {
      setCity(selectedCity);
      setLocationDetected(false);
      const newCompany = Object.keys(locationsData[selectedCity])[0];
      setCompany(newCompany);
      const newBuilding = Object.keys(locationsData[selectedCity][newCompany])[0];
      setBuilding(newBuilding);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCompany = e.target.value;
      setCompany(newCompany);
      if (city && locationsData[city][newCompany]) {
        const newBuilding = Object.keys(locationsData[city][newCompany])[0];
        setBuilding(newBuilding);
      } else {
        setBuilding('');
      }
  };
  
  const handleBuildingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setBuilding(e.target.value);
  };

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Successfully retrieved location:', position.coords);
          // Simulate detecting Bangalore as per screenshot
          const targetCity = 'Bangalore';
          const targetCompany = 'Amazon';
          const targetBuilding = 'Building 2';
          
          setCity(targetCity);
          setCompany(targetCompany);
          setBuilding(targetBuilding);
          setLocationDetected(true);
        },
        (error) => {
          console.error(`Geolocation error: ${error.message}. Please ensure location services are enabled and permissions are granted.`);
          // Fallback for demo
           const targetCity = 'Bangalore';
           const targetCompany = 'Amazon';
           const targetBuilding = 'Building 2';
           setCity(targetCity);
           setCompany(targetCompany);
           setBuilding(targetBuilding);
           setLocationDetected(true);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length) {
        setStep(s => s + 1);
    } else {
        onSignupSuccess();
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg animate-fadeIn">
        {step !== 2 && (
            <>
                <h2 className="text-2xl font-bold text-center text-text-primary mb-1">Create Vendor Account</h2>
                <p className="text-center text-text-secondary mb-6">Join our network of excellent food partners.</p>
                <ProgressBar currentStep={step} />
            </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
                <div className="space-y-4 animate-fadeIn">
                    <InputField icon={<BuildingOfficeIcon className="w-5 h-5"/>} type="text" placeholder="Café Name" id="cafeName" />
                    <InputField icon={<UserIcon className="w-5 h-5"/>} type="text" placeholder="Owner / Manager Name" id="ownerName" />
                    {/* <InputField icon={<MailIcon className="w-5 h-5"/>} type="email" placeholder="Business Email" id="email" /> */}
                    <div className="relative">
                        <label htmlFor="phone" className="absolute -top-2.5 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-900 z-10">Phone Number</label>
                        <div className="flex rounded-md">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-medium-gray bg-gray-50 text-text-secondary">
                                +91
                            </span>
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary pointer-events-none">
                                    <PhoneIcon className="w-5 h-5"/>
                                </span>
                                <input
                                    type="tel"
                                    id="phone"
                                    placeholder="9876543210"
                                    className="w-full pl-10 pr-3 py-2 border border-medium-gray rounded-r-md border-l-0 focus:outline-none focus:ring-2 focus:ring-offo-orange focus:border-transparent"
                                    required
                                    pattern="\d{10}"
                                    maxLength={10}
                                    title="Please enter a 10-digit phone number."
                                />
                            </div>
                        </div>
                    </div>
                    <InputField icon={<LockClosedIcon className="w-5 h-5"/>} type="password" placeholder="Password" id="password" />
                    <InputField icon={<LockClosedIcon className="w-5 h-5"/>} type="password" placeholder="Confirm Password" id="confirmPassword" />
                </div>
            )}
            {step === 2 && (
                 <div className="space-y-4 animate-fadeIn">
                    <div className="flex items-center -mx-4 -mt-4 mb-4">
                        <button type="button" onClick={() => setStep(s => s - 1)} className="p-3 rounded-full hover:bg-gray-100">
                            <ArrowLeftIcon className="w-6 h-6 text-text-secondary" />
                        </button>
                        <h3 className="text-xl font-bold text-text-primary ml-2">Select your Location</h3>
                    </div>

                    <SelectField label="Select Your City" id="city" value={city} onChange={(e) => handleCitySelect(e.target.value)}>
                        <option value="" disabled>Select a city</option>
                        {Object.keys(locationsData).map(c => <option key={c} value={c}>{c}</option>)}
                    </SelectField>

                    <SelectField label="Select your company" id="company" value={company} onChange={handleCompanyChange} disabled={!city}>
                        <option value="" disabled>{city ? 'Select a company' : 'Select a city first'}</option>
                        {city && Object.keys(locationsData[city]).map(c => <option key={c} value={c}>{c}</option>)}
                    </SelectField>

                    <SelectField label="Select Building" id="building" value={building} onChange={handleBuildingChange} disabled={!company}>
                        <option value="" disabled>{company ? 'Select a building' : 'Select a company first'}</option>
                        {city && company && locationsData[city]?.[company] && Object.keys(locationsData[city][company]).map(b => <option key={b} value={b}>{b}</option>)}
                    </SelectField>
                    
                    <div className="flex items-center pt-2">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500 text-sm font-semibold">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleUseLocation}
                        className="w-full text-center py-3 px-4 border-2 border-offo-orange text-offo-orange font-bold rounded-md hover:bg-offo-orange/10 transition-colors"
                    >
                        Use My Current Location
                    </button>
                    {locationDetected && (
                        <div className="mt-4 animate-fadeIn">
                            <img src="../../assets/location/cafe map.jpg" alt="Map showing detected location" className="w-full rounded-lg border" />
                            <p className="text-center text-sm text-text-secondary mt-2 font-medium">Detected: {company}, {building} (Detected)</p>
                        </div>
                    )}
                </div>
            )}
            {step === 3 && (
                 <div className="space-y-4 animate-fadeIn">
                    <InputField icon={<BuildingOfficeIcon className="w-5 h-5"/>} type="text" placeholder="Café Type (e.g., Restaurant)" id="cafeType" />
                    <InputField icon={<ClockIcon className="w-5 h-5"/>} type="text" placeholder="Opening Hours (e.g., 9 AM - 6 PM)" id="hours" />
               
                    <InputField icon={<BuildingOfficeIcon className="w-5 h-5"/>} type="text" placeholder="GST / Tax Number (Optional)" id="gst" required={false} />
                </div>
            )}

            <div className="pt-4">
                {step === 2 ? (
                    <button 
                        type="submit" 
                        className="w-full bg-offo-orange text-white font-bold py-3 px-4 rounded-lg hover:bg-offo-orange-dark transition-colors"
                    >
                        Confirm
                    </button>
                ) : (
                    <div className="flex justify-between items-center">
                        <button 
                            type="button" 
                            onClick={() => setStep(s => s - 1)}
                            disabled={step === 1}
                            className="bg-gray-200 text-text-secondary font-bold py-2 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            <ArrowLeftIcon className="w-4 h-4" />
                            <span>Back</span>
                        </button>
                        <button 
                            type="submit" 
                            className="bg-offo-orange text-white font-bold py-2 px-4 rounded-md hover:bg-offo-orange-dark transition-colors flex items-center space-x-2"
                        >
                            <span>{step === STEPS.length ? 'Create Account' : 'Next'}</span>
                            <ArrowRightIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </form>

        {step !== 2 && (
            <p className="text-center text-sm text-text-secondary mt-6">
                Already have an account?{' '}
                <button onClick={switchToLogin} className="font-semibold text-offo-orange hover:underline">
                    Login
                </button>
            </p>
        )}
    </div>
  );
};
