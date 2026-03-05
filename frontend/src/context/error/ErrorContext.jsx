import { createContext, useContext, useState, useCallback } from "react";

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  const showError = useCallback((message) => {
    setError(message);

    // Автоматическое скрытие через 4 секунды
    setTimeout(() => setError(null), 4000);
  }, []);

  return (
    <ErrorContext.Provider value={{ error, showError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useError() {
  return useContext(ErrorContext);
}
