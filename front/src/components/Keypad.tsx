import React from "react";

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onKeyPress(num.toString())}
          className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
        >
          {num}
        </button>
      ))}
      <button
        onClick={() => onKeyPress(".")}
        className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
      >
        .
      </button>
      <button
        onClick={() => onKeyPress("0")}
        className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
      >
        0
      </button>
      <button
        onClick={() => onKeyPress("backspace")}
        className="bg-white border border-gray-200 rounded-button py-4 text-xl font-semibold cursor-pointer whitespace-nowrap"
      >
        <i className="fas fa-backspace"></i>
      </button>
    </div>
  );
};

export default Keypad;
