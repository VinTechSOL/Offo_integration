
import React from 'react';
import { constants } from '../constants.ts';

export const BrandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] space-y-6 text-center">
      <div className={`w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4`}>
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
        </svg>
      </div>
      <h1 className={`text-4xl font-bold text-${constants.colors.TEXT_DARK}`}>Branding Coming Soon</h1>
      <p className="text-gray-500 max-w-md text-lg">
        Soon you will be able to customize your store's look and feel, upload logos, and set themes directly from here.
      </p>
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-400 font-medium">Feature in development</p>
      </div>
    </div>
  );
};
