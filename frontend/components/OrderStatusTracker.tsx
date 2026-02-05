import React from 'react';
import type { Order } from '../types';

const allStatuses: Order['status'][] = ['Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery'];

const OrderStatusTracker: React.FC<{ status: Order['status'] }> = ({ status }) => {
    const currentIndex = allStatuses.indexOf(status);

    const getStatusName = (s: Order['status']) => {
        if (s === 'Ready for Pickup') return 'Ready';
        if (s === 'Out for Delivery') return 'Completed';
        return s;
    };

    if (currentIndex === -1) {
        return null; // Don't render for non-ongoing statuses
    }

    return (
        <div className="flex items-center w-full">
            {allStatuses.map((s, index) => {
                const isActive = index === currentIndex;
                const isCompleted = index < currentIndex;
                return (
                    <React.Fragment key={s}>
                        <div className="flex flex-col items-center">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500' : isActive ? 'bg-orange-500 ring-4 ring-orange-500/30' : 'bg-gray-300'}`}>
                                {isCompleted && <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                {isActive && <div className="w-3 h-3 bg-white rounded-full"></div>}
                            </div>
                            <p className={`mt-2 text-xs text-center font-semibold w-20 ${isActive ? 'text-orange-600' : isCompleted ? 'text-gray-800' : 'text-gray-500'}`}>{getStatusName(s)}</p>
                        </div>
                        {index < allStatuses.length - 1 && <div className={`flex-grow h-1.5 -mx-2 transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default OrderStatusTracker;