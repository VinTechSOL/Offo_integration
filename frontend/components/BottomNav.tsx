// import React from 'react';
// import type { Screen } from '../App';

// interface IconProps {
//     className?: string;
// }

// const HomeIcon: React.FC<IconProps> = ({ className }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
//         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M3 10.5v.75a3 3 0 003 3h1.5v3a3 3 0 003 3h3a3 3 0 003-3v-3H18a3 3 0 003-3v-.75m-15 0A2.25 2.25 0 014.5 8.25h15a2.25 2.25 0 012.25 2.25m-15 0h15" />
//     </svg>
// );
// const OrdersIcon: React.FC<IconProps> = ({ className }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
//         <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
//     </svg>
// );
// const HelpIcon: React.FC<IconProps> = ({ className }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
//       <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
//     </svg>
// );
// const ProfileIcon: React.FC<IconProps> = ({ className }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
//         <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
//     </svg>
// );

// interface BottomNavProps {
//     activeScreen: Screen;
//     navigateTo: (screen: Screen) => void;
// }

// const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, navigateTo }) => {
//     const navItems = [
//         { screen: 'home', label: 'Explore', icon: HomeIcon },
//         { screen: 'orders', label: 'My Orders', icon: OrdersIcon },
//         { screen: 'help', label: 'Help', icon: HelpIcon },
//         { screen: 'profile', label: 'Profile', icon: ProfileIcon }
//     ];

//     return (
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
//             <div className="flex justify-around items-center h-16">
//                 {navItems.map((item) => (
//                     <button
//                         key={item.screen}
//                         onClick={() => navigateTo(item.screen as Screen)}
//                         className="flex flex-col items-center justify-center text-gray-500 w-1/4"
//                     >
//                         <item.icon className={`h-6 w-6 mb-1 ${activeScreen === item.screen ? 'text-orange-500' : ''}`} />
//                         <span className={`text-xs ${activeScreen === item.screen ? 'text-orange-500 font-semibold' : ''}`}>
//                             {item.label}
//                         </span>
//                     </button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default BottomNav;


import React from 'react';
import { Screen } from '@/types/navigation';

interface IconProps {
    className?: string;
}

const HomeIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M3 10.5v.75a3 3 0 003 3h1.5v3a3 3 0 003 3h3a3 3 0 003-3v-3H18a3 3 0 003-3v-.75m-15 0A2.25 2.25 0 014.5 8.25h15a2.25 2.25 0 012.25 2.25m-15 0h15" />
    </svg>
);
const OrdersIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.658-.463 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
);
const HelpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
);
const ProfileIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

interface BottomNavProps {
    activeScreen: Screen;
    navigateTo: (screen: Screen) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, navigateTo }) => {
    const navItems = [
        { screen: 'home', label: 'Explore', icon: HomeIcon },
        { screen: 'orders', label: 'My Orders', icon: OrdersIcon },
        { screen: 'help', label: 'Help', icon: HelpIcon },
        { screen: 'profile', label: 'Profile', icon: ProfileIcon }
    ];

    return (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <button
                        key={item.screen}
                        onClick={() => navigateTo(item.screen as Screen)}
                        className="flex flex-col items-center justify-center text-gray-500 w-1/4"
                    >
                        <item.icon className={`h-6 w-6 mb-1 ${activeScreen === item.screen ? 'text-orange-500' : ''}`} />
                        <span className={`text-xs ${activeScreen === item.screen ? 'text-orange-500 font-semibold' : ''}`}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BottomNav;
