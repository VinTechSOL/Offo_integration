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

/* =========================================================
   TIME HELPERS
========================================================= */

/**
 * Returns the earliest datetime at which an order can be scheduled.
 *
 * Rule:
 * Current time + 1 hour
 *
 * Example:
 * Current time = 3:30 PM
 * Minimum      = 4:30 PM
 */
const getMinimumScheduleDateTime = () => {
  const minimum = new Date();

  minimum.setMinutes(minimum.getMinutes() + 60);

  // Scheduling is minute-based.
  minimum.setSeconds(0, 0);

  return minimum;
};

/**
 * Converts a Date into the TimePicker format:
 *
 * HH:MM AM/PM
 *
 * Example:
 * 16:30 -> 04:30 PM
 */
const getTimeFromDate = (date: Date) => {
  let hours = date.getHours();

  const minutes = date
    .getMinutes()
    .toString()
    .padStart(2, '0');

  const period = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours || 12;

  return `${hours
    .toString()
    .padStart(2, '0')}:${minutes} ${period}`;
};

/**
 * Converts a time string such as:
 *
 * 04:30 PM
 *
 * into a Date using the supplied calendar date.
 */
const createDateTimeFromTime = (
  date: Date,
  time: string,
) => {
  const [timePart, modifier] = time.split(' ');

  let [hours, minutes] = timePart
    .split(':')
    .map(Number);

  if (modifier === 'PM' && hours !== 12) {
    hours += 12;
  }

  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }

  const result = new Date(date);

  result.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return result;
};

/**
 * Checks whether a selected date/time violates
 * the 1-hour minimum scheduling rule.
 *
 * For future dates, there is no 1-hour restriction.
 *
 * For today:
 * selected datetime must be >= current time + 1 hour.
 */
const isTimeWithinMinimumBuffer = (
  date: Date,
  time: string,
) => {
  const minimumScheduleTime =
    getMinimumScheduleDateTime();

  const selectedDateTime =
    createDateTimeFromTime(
      date,
      time,
    );

  return (
    selectedDateTime < minimumScheduleTime
  );
};

/* =========================================================
   SCHEDULE SCREEN
========================================================= */

const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  orderDetails,
  setOrderDetails,
  orderToEdit,
  onUpdateOrder,
}) => {
  const navigate = useNavigate();

  const isEditMode = orderToEdit != null;

  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [initialSelectedDates, setInitialSelectedDates] =
    useState<Date[]>([]);

  const [selectedDates, setSelectedDates] =
    useState<Date[]>([]);

  const [scheduleTime, setScheduleTime] =
    useState(() =>
      getTimeFromDate(
        getMinimumScheduleDateTime(),
      ),
    );

  const [repeat, setRepeat] =
    useState<'none' | 'weekly'>('none');

  const [notification, setNotification] =
    useState<string | null>(null);

  /* =======================================================
     TODAY
  ======================================================= */

  const getToday = () => {
    const date = new Date();

    date.setHours(0, 0, 0, 0);

    return date;
  };

  const today = getToday();

  /* =======================================================
     EDIT MODE INITIALIZATION
  ======================================================= */

  useEffect(() => {
    if (isEditMode && orderToEdit) {
      const orderDate =
        new Date(orderToEdit.date);

      setSelectedDates([orderDate]);
      setInitialSelectedDates([orderDate]);

      setCurrentDate(
        new Date(
          orderDate.getFullYear(),
          orderDate.getMonth(),
          1,
        ),
      );

      let hours =
        orderDate.getHours();

      const minutes =
        orderDate
          .getMinutes()
          .toString()
          .padStart(2, '0');

      const ampm =
        hours >= 12
          ? 'PM'
          : 'AM';

      hours = hours % 12;
      hours = hours || 12;

      const hoursStr =
        hours
          .toString()
          .padStart(2, '0');

      setScheduleTime(
        `${hoursStr}:${minutes} ${ampm}`,
      );
    }
  }, [
    isEditMode,
    orderToEdit,
  ]);

  /* =======================================================
     CALENDAR
  ======================================================= */

  const calendarGrid = useMemo(() => {
    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();

    const firstDayOfMonth =
      new Date(
        year,
        month,
        1,
      ).getDay();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0,
      ).getDate();

    const grid: (number | null)[] = [];

    for (
      let i = 0;
      i < firstDayOfMonth;
      i++
    ) {
      grid.push(null);
    }

    for (
      let i = 1;
      i <= daysInMonth;
      i++
    ) {
      grid.push(i);
    }

    return grid;
  }, [currentDate]);

  /* =======================================================
     MONTH NAVIGATION
  ======================================================= */

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1,
      ),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      ),
    );
  };

  /* =======================================================
     DATE HELPERS
  ======================================================= */

  const isSameDay = (
    d1: Date,
    d2: Date,
  ) =>
    d1.getFullYear() ===
      d2.getFullYear() &&
    d1.getMonth() ===
      d2.getMonth() &&
    d1.getDate() ===
      d2.getDate();

  const isToday = (date: Date) =>
    isSameDay(
      date,
      new Date(),
    );

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const showNotification = (
    message: string,
  ) => {
    setNotification(message);

    setTimeout(() => {
      setNotification(null);
    }, 4300);
  };

  /* =======================================================
     RESET TODAY'S TIME TO MINIMUM
  ======================================================= */

  const resetToMinimumTime = () => {
    const minimumTime =
      getMinimumScheduleDateTime();

    setScheduleTime(
      getTimeFromDate(
        minimumTime,
      ),
    );
  };

  /* =======================================================
     DATE CLICK
  ======================================================= */

  const handleDateClick = (
    day: number | null,
  ) => {
    if (day === null) return;

    const clicked = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );

    clicked.setHours(
      0,
      0,
      0,
      0,
    );

    // Do not allow previous dates.
    if (clicked < today) {
      return;
    }

    /* -----------------------------------------------------
       EDIT MODE
    ----------------------------------------------------- */

    if (isEditMode) {
      setSelectedDates([clicked]);
      setInitialSelectedDates([clicked]);

      // If today is selected, automatically enforce
      // current time + 1 hour.
      if (isToday(clicked)) {
        resetToMinimumTime();
      }

      return;
    }

    /* -----------------------------------------------------
       NORMAL MODE
    ----------------------------------------------------- */

    const exists =
      initialSelectedDates.some(
        (date) =>
          isSameDay(
            date,
            clicked,
          ),
      );

    const updated = exists
      ? initialSelectedDates.filter(
          (date) =>
            !isSameDay(
              date,
              clicked,
            ),
        )
      : [
          ...initialSelectedDates,
          clicked,
        ];

    updated.sort(
      (a, b) =>
        a.getTime() -
        b.getTime(),
    );

    setInitialSelectedDates(
      updated,
    );

    setSelectedDates(
      updated,
    );

    setRepeat('none');

    /*
     * If today is selected, immediately reset
     * the time to current + 1 hour.
     */
    if (
      updated.some((date) =>
        isToday(date),
      )
    ) {
      resetToMinimumTime();
    }
  };

  /* =======================================================
     REPEAT
  ======================================================= */

  const handleRepeatChange = (
    value: 'none' | 'weekly',
  ) => {
    setRepeat(value);

    if (
      initialSelectedDates.length ===
      0
    ) {
      if (value === 'weekly') {
        showNotification(
          'Please select a date first.',
        );
      }

      return;
    }

    if (value === 'none') {
      setSelectedDates([
        ...initialSelectedDates,
      ]);

      return;
    }

    const expanded =
      new Set<number>(
        initialSelectedDates.map(
          (date) =>
            date.getTime(),
        ),
      );

    initialSelectedDates.forEach(
      (base) => {
        for (
          let i = 1;
          i <= 3;
          i++
        ) {
          const next =
            new Date(base);

          next.setDate(
            next.getDate() +
              7 * i,
          );

          if (
            next >= today
          ) {
            expanded.add(
              next.getTime(),
            );
          }
        }
      },
    );

    const finalDates =
      Array.from(expanded)
        .map(
          (time) =>
            new Date(time),
        )
        .sort(
          (a, b) =>
            a.getTime() -
            b.getTime(),
        );

    setSelectedDates(
      finalDates,
    );

    /*
     * If the weekly selection includes today,
     * enforce the minimum time.
     */
    if (
      finalDates.some((date) =>
        isToday(date),
      )
    ) {
      resetToMinimumTime();
    }

    showNotification(
      'Weekly repeat applied for 4 weeks.',
    );
  };

  /* =======================================================
     TIME CHANGE
  ======================================================= */

  const handleScheduleTimeChange = (
    newTime: string,
  ) => {
    /*
     * No selected date yet.
     * Allow the TimePicker to update normally.
     */
    if (
      selectedDates.length === 0
    ) {
      setScheduleTime(newTime);
      return;
    }

    /*
     * If TODAY is among selected dates,
     * enforce current time + 1 hour.
     */
    const hasToday =
      selectedDates.some(
        (date) =>
          isToday(date),
      );

    if (hasToday) {
      const selectedDate =
        selectedDates.find(
          (date) =>
            isToday(date),
        );

      if (selectedDate) {
        const violatesRule =
          isTimeWithinMinimumBuffer(
            selectedDate,
            newTime,
          );

        if (violatesRule) {
          resetToMinimumTime();

          showNotification(
            'Orders must be scheduled at least 1 hour in advance.',
          );

          return;
        }
      }
    }

    setScheduleTime(newTime);
  };

  /* =======================================================
     UPDATE EXISTING ORDER
  ======================================================= */

  const handleUpdate = () => {
    if (
      selectedDates.length !== 1
    ) {
      alert(
        'Please select one date for the order.',
      );

      return;
    }

    if (!orderToEdit) {
      return;
    }

    const selectedDate =
      selectedDates[0];

    /*
     * Apply 1-hour validation for TODAY
     * even in edit mode.
     */
    if (
      isToday(selectedDate) &&
      isTimeWithinMinimumBuffer(
        selectedDate,
        scheduleTime,
      )
    ) {
      resetToMinimumTime();

      showNotification(
        'Orders must be scheduled at least 1 hour in advance.',
      );

      return;
    }

    const newScheduledDate =
      createDateTimeFromTime(
        selectedDate,
        scheduleTime,
      );

    const updatedOrder = {
      ...orderToEdit,
      date: newScheduledDate,
    };

    onUpdateOrder(
      updatedOrder,
    );
  };

  /* =======================================================
     CHECKOUT
  ======================================================= */

  const handleCheckout = () => {
    if (
      selectedDates.length === 0
    ) {
      alert(
        'Please select at least one date.',
      );

      return;
    }

    /*
     * Final frontend validation.
     *
     * This protects against:
     * - stale time
     * - user leaving the screen open
     * - current time moving forward
     */
    const hasInvalidTime =
      selectedDates.some(
        (date) =>
          isToday(date) &&
          isTimeWithinMinimumBuffer(
            date,
            scheduleTime,
          ),
      );

    if (hasInvalidTime) {
      resetToMinimumTime();

      showNotification(
        'Orders must be scheduled at least 1 hour in advance. Time has been reset.',
      );

      return;
    }

    const schedules: ScheduledItem[] =
      selectedDates.map(
        (date) => ({
          id: date.getTime(),
          date,
          time: scheduleTime,
        }),
      );

    const total =
      (
        orderDetails.subtotal *
        schedules.length
      )
      +
      orderDetails.convenienceFee
      +
      orderDetails.gst;

    setOrderDetails({
      ...orderDetails,
      schedules,
      total,
    });

    navigate('/payment');
  };

  /* =======================================================
     FORMAT SELECTED DATES
  ======================================================= */

  const formatSelectedDates = (
    dates: Date[],
  ) => {
    if (
      dates.length === 0
    ) {
      return 'None';
    }

    return dates
      .map((date) =>
        date.toLocaleDateString(
          'en-GB',
          {
            day: 'numeric',
            month: 'short',
          },
        ),
      )
      .join(', ');
  };

  /* =======================================================
     CHECKOUT TOTAL
  ======================================================= */

  const checkoutTotal =
    !isEditMode &&
    orderDetails
      ? (
          orderDetails.subtotal *
          selectedDates.length
        )
        +
        orderDetails.convenienceFee
        +
        orderDetails.gst
      : 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="flex flex-col h-full bg-[#FFF9F2] relative">


      {/* ===================================================
    NOTIFICATION / TOAST POPUP
=================================================== */}

      {notification && (
        <div className="fixed top-28 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none transition-all duration-300">
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md border border-orange-200 text-gray-800 py-3.5 px-4 rounded-2xl shadow-xl shadow-orange-950/10 pointer-events-auto ring-1 ring-black/5">
            {/* Warning Icon Badge */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.63-1.516 2.63H3.72c-1.347 0-2.189-1.463-1.516-2.63L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            {/* Message Text */}
            <p className="text-xs sm:text-sm font-medium leading-snug flex-1 text-gray-700">
              {notification}
            </p>

            {/* Manual Dismiss Button */}
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          HEADER
      =================================================== */}

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

        <div className="w-10" />
      </header>

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div className="flex-grow p-4 flex flex-col">
        {/* =================================================
            EDIT MODE ORDER SUMMARY
        ================================================= */}

        {isEditMode && orderToEdit && (
          <div className="mb-4 bg-white p-4 rounded-2xl shadow-sm border">
            <h3 className="font-bold text-gray-800 text-md mb-2">
              Editing Schedule for Order #{orderToEdit.id.slice(-5)}
            </h3>

            <div className="text-sm text-gray-600 space-y-1">
              {orderToEdit.items.map(({ item, quantity }) => (
                <div key={item.id} className="flex justify-between">
                  <span>
                    {quantity}x {item.name}
                  </span>

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

        <p className="font-semibold text-center text-sm text-gray-700 mb-2">
          Please select date and time
        </p>

        {/* =================================================
            CALENDAR CARD
        ================================================= */}

        <div className="bg-white p-3 rounded-2xl shadow-sm flex-1 flex flex-col">
          {/* ===============================================
              MONTH HEADER
          =============================================== */}

          <div className="flex justify-between items-center mb-2 px-2">
            <h2 className="text-base font-bold text-orange-500">
              {currentDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}{' '}
              ›
            </h2>

            <div className="flex space-x-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 text-gray-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* ===============================================
              DAYS
          =============================================== */}

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className="font-semibold text-gray-400 text-xs py-1"
              >
                {day}
              </div>
            ))}

            {calendarGrid.map((day, index) => {
              const date = day
                ? new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    day,
                  )
                : null;

              const isPast = date && date < today;

              const isSelected =
                date &&
                selectedDates.some((selected) => isSameDay(selected, date));

              const dateIsToday = date && isSameDay(date, today);

              return (
                <button
                  key={index}
                  disabled={!!isPast || !day}
                  onClick={() => handleDateClick(day)}
                  className={`w-8 h-8 text-sm rounded-full flex items-center justify-center mx-auto font-medium transition-colors duration-200
                      ${!day ? 'bg-transparent' : ''}
                      ${
                        isPast
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700'
                      }
                      ${
                        isSelected
                          ? 'bg-orange-500 text-white font-bold shadow-md'
                          : ''
                      }
                      ${
                        !isSelected && dateIsToday
                          ? 'border border-orange-500 text-orange-500'
                          : ''
                      }
                    `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* ===============================================
              TIME PICKER
          =============================================== */}

          <div className="border-t mt-3 pt-3">
            <TimePicker
              value={scheduleTime}
              onChange={handleScheduleTimeChange}
              selectedDate={selectedDates[0]}
            />

            {/* TODAY RULE MESSAGE */}

            {selectedDates.some((date) => isToday(date)) && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Orders must be scheduled at least 1 hour in advance for same day order.
              </p>
            )}
          </div>

          {/* ===============================================
              REPEAT WEEKLY
          =============================================== */}

          <div
            className={`mt-auto pt-3 ${
              isEditMode ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="flex items-center justify-between px-2">
              <h3 className="font-bold text-base text-gray-700">
                Repeat weekly
              </h3>

              <div className="flex items-center space-x-2">
                {/* YES */}

                <button
                  onClick={() => handleRepeatChange('weekly')}
                  className={`flex items-center justify-center space-x-2 w-24 p-3 font-semibold rounded-xl border-2 transition-all duration-200 ${
                    repeat === 'weekly'
                      ? 'bg-orange-50 border-orange-500 text-orange-600'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      repeat === 'weekly'
                        ? 'border-orange-500'
                        : 'border-gray-400'
                    }`}
                  >
                    {repeat === 'weekly' && (
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                    )}
                  </div>

                  <span>Yes</span>
                </button>

                {/* NO */}

                <button
                  onClick={() => handleRepeatChange('none')}
                  className={`flex items-center justify-center space-x-2 w-24 p-3 font-semibold rounded-xl border-2 transition-all duration-200 ${
                    repeat === 'none'
                      ? 'bg-orange-50 border-orange-500 text-orange-600'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      repeat === 'none'
                        ? 'border-orange-500'
                        : 'border-gray-400'
                    }`}
                  >
                    {repeat === 'none' && (
                      <div className="w-2.5 h-2.5 bg-orange-500 rounded-full" />
                    )}
                  </div>

                  <span>No</span>
                </button>
              </div>
            </div>

            {isEditMode && (
              <p className="text-xs text-center text-gray-500 mt-2">
                Repeat options are not available when editing a single order.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="p-4 border-t bg-white mt-auto">
        {/* ===============================================
            SELECTED SUMMARY
        =============================================== */}

        {selectedDates.length > 0 && (
          <div className="mb-4 bg-[#6F4E37] p-3 rounded-2xl text-white font-semibold space-y-1 shadow-lg animate-fade-in text-sm">
            <p>Selected dates : {formatSelectedDates(selectedDates)}</p>

            <p>Selected time : {scheduleTime}</p>

            {repeat !== 'none' && !isEditMode && (
              <p>
                Repeat : <span className="capitalize">{repeat}</span>
              </p>
            )}
          </div>
        )}

        {/* ===============================================
            CHECKOUT / UPDATE
        =============================================== */}

        <button
          onClick={isEditMode ? handleUpdate : handleCheckout}
          disabled={selectedDates.length === 0}
          className="w-full bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md hover:bg-orange-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isEditMode
            ? 'Update Schedule'
            : `Checkout - ₹${checkoutTotal.toFixed(2)}`}
        </button>
      </footer>
    </div>
  );
};

export default ScheduleScreen;