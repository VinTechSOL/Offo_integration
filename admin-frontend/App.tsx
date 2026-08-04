import React from "react";
import { AppRouter } from "./routes/AppRouter";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <>
      <AppRouter />

      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#111827',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
          error: {
            duration: 4000,
          },
        }}
      />
    </>
  );
};

export default App;