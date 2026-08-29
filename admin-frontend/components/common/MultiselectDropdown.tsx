import React, { useEffect, useRef, useState } from "react";

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedOptions,
  onChange,
  placeholder = "Select",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  /* =========================================================
     SELECTION STATE
  ========================================================= */

  const allSelected =
    options.length > 0 &&
    options.every((option) =>
      selectedOptions.includes(option)
    );

  const someSelected =
    selectedOptions.length > 0 &&
    !allSelected;

  /* =========================================================
     CLOSE ON OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =========================================================
     SELECT / DESELECT ALL
  ========================================================= */

  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  /* =========================================================
     INDIVIDUAL OPTION
  ========================================================= */

  const handleOptionToggle = (
    option: string
  ) => {
    if (selectedOptions.includes(option)) {
      onChange(
        selectedOptions.filter(
          (item) => item !== option
        )
      );
    } else {
      onChange([
        ...selectedOptions,
        option,
      ]);
    }
  };

  /* =========================================================
     BUTTON DISPLAY TEXT
  ========================================================= */

  const getDisplayText = () => {
    /* Nothing selected */

    if (selectedOptions.length === 0) {
      return placeholder;
    }

    /* Everything selected */

    if (allSelected) {
      return `All ${label}s`;
    }

    /* Exactly one selected */

    if (selectedOptions.length === 1) {
      return selectedOptions[0];
    }

    /* Multiple selected */

    return `${selectedOptions.length} selected`;
  };

  /* =========================================================
     SELECT ALL BUTTON TEXT
  ========================================================= */

  const selectAllText = allSelected
    ? `Deselect All`
    : `Select All`;

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      {/* =====================================================
          DROPDOWN BUTTON
      ===================================================== */}

      <button
        type="button"
        onClick={() =>
          setIsOpen((prev) => !prev)
        }
        className="w-full min-w-[140px] bg-white text-gray-700 px-4 py-2.5 rounded-lg border border-gray-300 text-sm flex items-center justify-between gap-3"
      >
        <span className="truncate">
          {getDisplayText()}
        </span>

        <svg
          className={`w-4 h-4 shrink-0 transition-transform ${
            isOpen
              ? "rotate-180"
              : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* =====================================================
          DROPDOWN MENU
      ===================================================== */}

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full min-w-[220px] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">

          {/* =================================================
              SELECT / DESELECT ALL
          ================================================= */}

          {options.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAll}
              className="w-full px-4 py-3 flex items-center gap-3 border-b border-gray-200 hover:bg-gray-50 text-left"
            >
              {/* Checkbox */}

              <span
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  allSelected
                    ? "bg-orange-500 border-orange-500"
                    : someSelected
                    ? "bg-orange-200 border-orange-500"
                    : "border-gray-300"
                }`}
              >
                {/* Fully selected */}

                {allSelected && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}

                {/* Partially selected */}

                {someSelected &&
                  !allSelected && (
                    <span className="w-2 h-0.5 bg-orange-500 rounded" />
                  )}
              </span>

              {/* Select / Deselect text */}

              <span className="text-sm font-semibold text-gray-800">
                {selectAllText}
              </span>
            </button>
          )}

          {/* =================================================
              OPTIONS
          ================================================= */}

          <div className="max-h-64 overflow-y-auto">

            {options.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-400">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const checked =
                  selectedOptions.includes(
                    option
                  );

                return (
                  <button
                    type="button"
                    key={option}
                    onClick={() =>
                      handleOptionToggle(
                        option
                      )
                    }
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 text-left"
                  >
                    {/* Checkbox */}

                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        checked
                          ? "bg-orange-500 border-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      {checked && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>

                    {/* Option name */}

                    <span className="text-sm text-gray-700 truncate">
                      {option}
                    </span>
                  </button>
                );
              })
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;