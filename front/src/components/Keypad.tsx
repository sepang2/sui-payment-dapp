import React from "react";

interface KeypadProps {
  onKeyPress: (key: string) => void;
}

const Keypad: React.FC<KeypadProps> = ({ onKeyPress }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {/* 1-9 숫자들 */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          onClick={() => onKeyPress(num.toString())}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg py-6 text-2xl font-medium text-gray-800 dark:text-white transition-colors"
        >
          {num}
        </button>
      ))}

      {/* 마지막 줄: '.', '0', 'backspace' */}
      <button
        onClick={() => onKeyPress(".")}
        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg py-6 text-2xl font-medium text-gray-800 dark:text-white transition-colors"
      >
        .
      </button>
      <button
        onClick={() => onKeyPress("0")}
        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg py-6 text-2xl font-medium text-gray-800 dark:text-white transition-colors"
      >
        0
      </button>
      <button
        onClick={() => onKeyPress("backspace")}
        className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg py-6 text-2xl font-medium text-gray-800 dark:text-white transition-colors flex items-center justify-center"
      >
        <i className="fas fa-backspace"></i>
      </button>
    </div>
  );
};

export default Keypad;
