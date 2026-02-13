
import React from 'react';
import Card from '../components/common/Card.tsx';
import { constants } from '../constants.ts';

export const ReportsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] space-y-6 text-center">
      <div className={`w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-${constants.colors.PRIMARY} mb-4`}>
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
        </svg>
      </div>
      <h1 className={`text-4xl font-bold text-${constants.colors.TEXT_DARK}`}>Reports Coming Soon</h1>
      <p className="text-gray-500 max-w-md text-lg">
        We are building comprehensive analytics to help you track your business growth. Stay tuned!
      </p>
      <Card className="px-8 py-4 bg-white border border-gray-200 shadow-sm mt-8">
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Expected Features</p>
        <div className="flex gap-4 mt-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Sales Trends
            </span>
            <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Export to PDF/CSV
            </span>
            <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Item Analysis
            </span>
        </div>
      </Card>
    </div>
  );
};
