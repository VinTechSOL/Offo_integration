import React, { useRef, useEffect, useMemo } from "react";

const ITEM_HEIGHT = 28;
const VISIBLE_ITEMS = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface PickerColumnProps {
  values: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const PickerColumn: React.FC<PickerColumnProps> = ({
  values,
  selectedValue,
  onSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(false);
  const scrollTimeout = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (containerRef.current) {
      const selectedIndex = values.indexOf(selectedValue);
      if (selectedIndex !== -1) {
        isProgrammaticScroll.current = true;
        containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
        setTimeout(() => {
          isProgrammaticScroll.current = false;
        }, 100);
      }
    }
  }, [selectedValue, values]);

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return;

    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

    scrollTimeout.current = window.setTimeout(() => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const selectedIndex = Math.round(scrollTop / ITEM_HEIGHT);
        const newValue = values[selectedIndex];

        if (newValue && newValue !== selectedValue) {
          onSelect(newValue);
        }
      }
    }, 150);
  };

  const paddingTop = (CONTAINER_HEIGHT - ITEM_HEIGHT) / 2;

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="no-scrollbar flex-1 text-center"
      style={{
        height: `${CONTAINER_HEIGHT}px`,
        overflowY: "scroll",
        scrollSnapType: "y mandatory",
      }}
    >
      <div
        style={{
          paddingTop: `${paddingTop}px`,
          paddingBottom: `${paddingTop}px`,
        }}
      >
        {values.map((val) => (
          <div
            key={val}
            className="flex items-center justify-center text-lg text-white"
            style={{
              height: `${ITEM_HEIGHT}px`,
              scrollSnapAlign: "center",
            }}
          >
            {val}
          </div>
        ))}
      </div>
    </div>
  );
};

interface TimePickerProps {
  value: string;
  onChange: (newTime: string) => void;
  selectedDate?: Date;
}

const hours = Array.from({ length: 12 }, (_, i) =>
  (i + 1).toString().padStart(2, "0")
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  i.toString().padStart(2, "0")
);
const periods = ["AM", "PM"];

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  selectedDate,
}) => {
  const [hour, minute, period] = useMemo(() => {
    const [time, p] = value.split(" ");
    const [h, m] = time.split(":");
    return [h, m, p];
  }, [value]);

  // 🔥 Helper to detect past time
  const isPastTime = (h: string, m: string, p: string) => {
    if (!selectedDate) return false;

    const now = new Date();

    // Only restrict if selected date is today
    if (selectedDate.toDateString() !== now.toDateString()) {
      return false;
    }

    let hoursNum = Number(h);
    const minutesNum = Number(m);

    if (p === "PM" && hoursNum !== 12) hoursNum += 12;
    if (p === "AM" && hoursNum === 12) hoursNum = 0;

    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hoursNum, minutesNum, 0, 0);

    return selectedDateTime <= now;
  };

  // 🔥 Auto-correct invalid time
  useEffect(() => {
    if (!selectedDate) return;

    if (isPastTime(hour, minute, period)) {
      const now = new Date();
      const bufferMinutes = 30; // preparation buffer
      const next = new Date(now.getTime() + bufferMinutes * 60000);

      let nextHour = next.getHours();
      const nextMinute = next.getMinutes().toString().padStart(2, "0");
      const nextPeriod = nextHour >= 12 ? "PM" : "AM";

      nextHour = nextHour % 12;
      nextHour = nextHour === 0 ? 12 : nextHour;

      const formattedHour = nextHour.toString().padStart(2, "0");

      onChange(`${formattedHour}:${nextMinute} ${nextPeriod}`);
    }
  }, [hour, minute, period, selectedDate]);

  const handleHourChange = (newHour: string) => {
    onChange(`${newHour}:${minute} ${period}`);
  };

  const handleMinuteChange = (newMinute: string) => {
    onChange(`${hour}:${newMinute} ${period}`);
  };

  const handlePeriodChange = (newPeriod: string) => {
    onChange(`${hour}:${minute} ${newPeriod}`);
  };

  return (
    <div
      className="relative flex w-full justify-center bg-[#264653] rounded-xl"
      style={{ height: `${CONTAINER_HEIGHT}px` }}
    >
      <div
        className="absolute inset-x-2 top-1/2 bg-white/10 rounded-lg -translate-y-1/2 pointer-events-none"
        style={{ height: `${ITEM_HEIGHT}px` }}
        aria-hidden="true"
      />

      <div
        className="flex w-full max-w-xs mx-auto"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
        }}
      >
        <PickerColumn
          values={hours}
          selectedValue={hour}
          onSelect={handleHourChange}
        />
        <PickerColumn
          values={minutes}
          selectedValue={minute}
          onSelect={handleMinuteChange}
        />
        <PickerColumn
          values={periods}
          selectedValue={period}
          onSelect={handlePeriodChange}
        />
      </div>
    </div>
  );
};

export default TimePicker;