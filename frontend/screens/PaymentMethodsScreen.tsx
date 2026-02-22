import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ScrollableContainer from '../components/ScrollableContainer';



const phonePeIconUrl = '../../assets/icons/phonepe.jpeg';

interface UpiMethod {
    id: number;
    upiId: string;
}

const PaymentMethodsScreen: React.FC = () => {
    const navigate = useNavigate();
    const [methods, setMethods] = useState<UpiMethod[]>([
        { id: 1, upiId: 'johndoe@ybl' },
        { id: 2, upiId: '9876543210@paytm' },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUpiId, setNewUpiId] = useState('');

    const handleRemove = (idToRemove: number) => {
        setMethods(methods.filter(m => m.id !== idToRemove));
    };

    const handleAdd = () => {
        if (newUpiId && newUpiId.includes('@')) {
            setMethods([...methods, { id: Date.now(), upiId: newUpiId }]);
            setNewUpiId('');
            setShowAddModal(false);
        } else {
            alert('Please enter a valid UPI ID.');
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-[#FFF9F2]">
             {showAddModal && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20" aria-modal="true" role="dialog">
                    <div className="bg-white p-6 rounded-2xl shadow-xl w-4/5">
                        <h2 className="text-lg font-bold mb-4 text-gray-800">Add New UPI ID</h2>
                        <input 
                            type="text"
                            value={newUpiId}
                            onChange={(e) => setNewUpiId(e.target.value)}
                            placeholder="yourname@bank"
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 mb-4"
                        />
                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold">Cancel</button>
                            <button onClick={handleAdd} className="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold">Add</button>
                        </div>
                    </div>
                </div>
            )}
            <header className="p-4 flex items-center border-b sticky top-0 bg-[#FFF9F2] z-10">
                <div className="w-1/5">
                    <button onClick={() => navigate('/profile')}>
                        <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
                <div className="w-3/5 text-center">
                    <h1 className="text-xl font-bold text-gray-800">Phone Pe UPI IDs</h1>
                </div>
                <div className="w-1/5"></div>
            </header>

            <ScrollableContainer className="p-4 space-y-3">
                 <h2 className="font-bold text-lg text-gray-800 my-2">Saved Phone Pe UPI IDs</h2>
                 {methods.length > 0 ? (
                    methods.map(method => (
                        <div key={method.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between">
                            <div className="flex items-center">
                                <img src={phonePeIconUrl} alt="Phone Pe" className="h-8 w-auto mr-4" />
                                <span className="font-semibold text-gray-700">{method.upiId}</span>
                            </div>
                            <button onClick={() => handleRemove(method.id)} className="text-sm font-semibold text-red-500">
                                Remove
                            </button>
                        </div>
                    ))
                 ) : (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No saved payment methods.</p>
                    </div>
                 )}
            </ScrollableContainer>

            <footer className="p-4 border-t bg-white">
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full bg-orange-100 text-orange-600 font-bold py-4 rounded-xl border-2 border-dashed border-orange-400"
                >
                    + Add New UPI ID
                </button>
            </footer>
        </div>
    );
};

export default PaymentMethodsScreen;