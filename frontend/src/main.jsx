import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App.jsx";
import { AuthProvider } from "@context/AuthContext.jsx";
import { ErrorProvider } from "@context/ErrorContext.jsx";
import { UIProvider } from "@context/UIContext.jsx";
import { SearchProvider } from "@context/SearchContext.jsx";
import { ErrorToast } from "@components";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorProvider>
      <AuthProvider>
        <UIProvider>
          <SearchProvider>
            <App />
            <ErrorToast />
          </SearchProvider>
        </UIProvider>
      </AuthProvider>
    </ErrorProvider>
  </StrictMode>
);
