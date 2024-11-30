// src/ThemeContext.js
import React, { createContext, useState } from 'react';

const ThemeToggleContext = createContext();

export const ThemeToggleProvider = ({ children }) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  return (
    <ThemeToggleContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeToggleContext.Provider>
  );
};

export default ThemeToggleContext;
