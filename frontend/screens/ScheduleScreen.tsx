import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { OrderDetails, ScheduledItem, Order } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import TimePicker from '../components/TimePicker';

interface ScheduleScreenProps {
  orderDetails: OrderDetails;
  setOrderDetails: React.Dispatch<React.SetStateAction<OrderDetails | null>>;
  orderToEdit: Order | null;
  onUpdateOrder: (updatedOrder: Order) => void;
}

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  orderDetails,
  setOrderDetails,
  orderToEdit,
  onUpdateOrder
}) => {

  const navigate = useNavigate();

  const isEditMode = orderToEdit != null;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [initialSelectedDates, setInitialSelectedDates] = useState<Date[]>([]);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [scheduleTime, setScheduleTime] = useState('08:00 AM');
  const [repeat, setRepeat] = useState<'none' | 'weekly'>('none');
  const [notification, setNotification] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0,0,0,0);

  useEffect(() => {
    if (isEditMode && orderToEdit) {
      const orderDate = orderToEdit.date;

      setSelectedDates([orderDate]);
      setInitialSelectedDates([orderDate]);
      setCurrentDate(new Date(orderDate.getFullYear(), orderDate.getMonth(), 1));

      let hours = orderDate.getHours();
      const minutes = orderDate.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hoursStr = hours.toString().padStart(2, '0');
      setScheduleTime(`${hoursStr}:${minutes} ${ampm}`);
    }
  }, [isEditMode, orderToEdit]);

  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const grid: (number | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) grid.push(null);
    for (let i = 1; i <= daysInMonth; i++) grid.push(i);

    return grid;
  }, [currentDate]);


  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };


  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const handleDateClick = (day: number | null) => {
    if (day === null) return;

    const clicked = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    clicked.setHours(0,0,0,0);

    if (clicked < today) return;

    if (isEditMode) {
      setSelectedDates([clicked]);
      setInitialSelectedDates([clicked]);
      return;
    }

    const exists = initialSelectedDates.some(d => isSameDay(d, clicked));
    const updated = exists
      ? initialSelectedDates.filter(d => !isSameDay(d, clicked))
      : [...initialSelectedDates, clicked];

    updated.sort((a,b) => a.getTime() - b.getTime());

    setInitialSelectedDates(updated);
    setSelectedDates(updated);
    setRepeat('none');
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleRepeatChange = (value: 'none' | 'weekly') => {
    setRepeat(value);

    if (initialSelectedDates.length === 0) {
      if (value === 'weekly') {
        showNotification("Please select a date first.");
      }
      return;
    }

    if (value === 'none') {
      setSelectedDates([...initialSelectedDates]);
      return;
    }

    const expanded = new Set<number>(
      initialSelectedDates.map(d => d.getTime())
    );

    initialSelectedDates.forEach(base => {
      for (let i = 1; i <= 3; i++) {
        const next = new Date(base);
        next.setDate(next.getDate() + 7 * i);
        if (next >= today) expanded.add(next.getTime());
      }
    });

    const finalDates = Array.from(expanded)
      .map(t => new Date(t))
      .sort((a,b) => a.getTime() - b.getTime());

    setSelectedDates(finalDates);
    showNotification("Weekly repeat applied for 4 weeks.");
  };

  const handleUpdate = () => {
    if (selectedDates.length !== 1) {
      alert("Please select one date for the order.");
      return;
    }

    if (!orderToEdit) return;

    const newScheduledDate = new Date(selectedDates[0]);
    const [time, period] = scheduleTime.split(' ');
    let [hours, minutes] = time.split(':').map(Number);

    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    newScheduledDate.setHours(hours, minutes, 0, 0);

    const updatedOrder = {
      ...orderToEdit,
      date: newScheduledDate,
    };

    onUpdateOrder(updatedOrder);
  };

  const handleCheckout = () => {
    if (selectedDates.length === 0) {
      alert("Please select at least one date.");
      return;
    }

    const schedules: ScheduledItem[] = selectedDates.map(date => ({
      id: date.getTime(),
      date,
      time: scheduleTime,
    }));

    const total =
      (orderDetails.subtotal + orderDetails.convenienceFee)
      * schedules.length;

    setOrderDetails({
      ...orderDetails,
      schedules,
      total,
    });

    navigate('/payment');
  };

  const formatSelectedDates = (dates: Date[]) => {
    if (dates.length === 0) return 'None';
    return dates
      .map(d =>
        d.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
        })
      )
      .join(', ');
  };

  const isTimeInPast = (date: Date, time: string) => {
    const now = new Date();

    // Only validate if selected date is today
    if (date.toDateString() !== now.toDateString()) {
      return false;
    }

    const [timePart, modifier] = time.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    return selectedDateTime <= now;
  };
  

  const checkoutTotal =
    !isEditMode && orderDetails
      ? (orderDetails.subtotal + orderDetails.convenienceFee)
        * selectedDates.length
      : 0;

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2] relative">

      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm font-semibold py-2 px-4 rounded-full shadow-lg z-20 animate-fade-in-slow">
          {notification}
        </div>
      )}

      <header className="p-4 flex items-center flex-shrink-0">
        <button
          onClick={() => navigate(isEditMode ? '/orders' : '/cart')}
          className="p-2"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
        </button>

        <h1 className="text-xl font-bold text-gray-800 flex-grow text-center">
          {isEditMode ? 'Edit Schedule' : 'Schedule Order'}
        </h1>

        <div className="w-10"></div>
      </header>

      <div className="flex-grow p-4 flex flex-col">
        {isEditMode && orderToEdit && (
            <div className="mb-4 bg-white p-4 rounded-2xl shadow-sm border">
                <h3 className="font-bold text-gray-800 text-md mb-2">Editing Schedule for Order #{orderToEdit.id.slice(-5)}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                    {orderToEdit.items.map(({ item, quantity }) => (
                        <div key={item.id} className="flex justify-between">
                            <span>{quantity}x {item.name}</span>
                            <span>₹{(item.price * quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between font-semibold text-gray-700">
                    <span>Total</span>
                    <span>₹{orderToEdit.total.toFixed(2)}</span>
                </div>
            </div>
        )}
        <p className="font-semibold text-center text-sm text-gray-700 mb-2">Please select date and time</p>
        
        <div className="bg-white p-3 rounded-2xl shadow-sm flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-2 px-2">
              <h2 className="text-base font-bold text-orange-500">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })} ›</h2>
              <div className="flex space-x-1">
                <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
          </div>
          <div className="grid grid-cols-7 gap-y-1 text-center">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day,index) => ( <div key={index} className="font-semibold text-gray-400 text-xs py-1">{day}</div>))}
              {calendarGrid.map((day, index) => {
                  const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null;
                  const isPast = date && date < today;
                  const isSelected = date && selectedDates.some(d => isSameDay(d, date));
                  const isToday = date && isSameDay(date, today);

                  return (
                      <button 
                          key={index}
                          disabled={isPast || !day}
                          onClick={() => handleDateClick(day)}
                          className={`w-8 h-8 text-sm rounded-full flex items-center justify-center mx-auto font-medium transition-colors duration-200
                            ${!day ? 'bg-transparent' : ''}
                            ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'}
                            ${isSelected ? 'bg-orange-500 text-white font-bold shadow-md' : ''}
                            ${!isSelected && isToday ? 'border border-orange-500 text-orange-500' : ''}
                          `}
                      >
                          {day}
                      </button>
                  )
              })}
          </div>
          <div className="border-t mt-3 pt-3">
             <TimePicker 
               value={scheduleTime} 
               onChange={setScheduleTime} 
               selectedDate={selectedDates[0]}
              />
          </div>

          <div className={`mt-auto pt-3 ${isEditMode ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-base text-gray-700">Repeat weekly</h3>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleRepeatChange('weekly')}
                        className={`flex items-center justify-center space-x-2 w-24 p-3 font-semibold rounded-xl border-2 transition-all duration-200 ${
                            repeat === 'weekly'
                            ? 'bg-orange-50 border-orange-500 text-orange-600'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${repeat === 'weekly' ? 'border-orange-500' : 'border-gray-400'}`}>
                            {repeat === 'weekly' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                        </div>
                        <span>Yes</span>
                    </button>
                    <button
                        onClick={() => handleRepeatChange('none')}
                        className={`flex items-center justify-center space-x-2 w-24 p-3 font-semibold rounded-xl border-2 transition-all duration-200 ${
                            repeat === 'none'
                            ? 'bg-orange-50 border-orange-500 text-orange-600'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                    >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${repeat === 'none' ? 'border-orange-500' : 'border-gray-400'}`}>
                            {repeat === 'none' && <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>}
                        </div>
                        <span>No</span>
                    </button>
                </div>
            </div>
            {isEditMode && <p className="text-xs text-center text-gray-500 mt-2">Repeat options are not available when editing a single order.</p>}
          </div>
        </div>
      </div>

      <footer className="p-4 border-t bg-white mt-auto">
        {selectedDates.length > 0 && (
            <div className="mb-4 bg-[#6F4E37] p-3 rounded-2xl text-white font-semibold space-y-1 shadow-lg animate-fade-in text-sm">
                <p>Selected dates : {formatSelectedDates(selectedDates)}</p>
                <p>Selected time : {scheduleTime}</p>
                {repeat !== 'none' && !isEditMode && <p>Repeat : <span className="capitalize">{repeat}</span></p>}
            </div>
        )}
        <button
          onClick={isEditMode ? handleUpdate : handleCheckout}
          disabled={selectedDates.length === 0}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isEditMode ? 'Update Schedule' : `Checkout - ₹${checkoutTotal.toFixed(2)}`}
        </button>
      </footer>
    </div>
  );
};

export default ScheduleScreen;