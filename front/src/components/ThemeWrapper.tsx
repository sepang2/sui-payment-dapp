import React from "react";
import { Theme } from "@radix-ui/themes";
import { useDarkMode } from "../contexts/DarkModeContext";

interface ThemeWrapperProps {
  children: React.ReactNode;
}

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  const { isDarkMode } = useDarkMode();

  return <Theme appearance={isDarkMode ? "dark" : "light"}>{children}</Theme>;
};

export default ThemeWrapper;
