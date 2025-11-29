// App.tsx
import React from "react";

const App: React.FC = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#020617", // fundo escuro
        color: "#f9fafb", // texto claro
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#0f172a",
          padding: "2rem 2.5rem",
          borderRadius: "1.5rem",
          boxShadow: "0 25px 50px -12px rgba(15,23,42,0.7)",
          textAlign: "center",
          maxWidth: "420px",
        }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Nauticos Logbook
        </h1>
        <p style={{ fontSize: "0.95rem", color: "#cbd5f5", marginBottom: "0.5rem" }}>
          Deploy funcionando 🚢
        </p>
        <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
          Esta é só uma tela de teste.  
          Depois a gente volta com o layout completo e o login.
        </p>
      </div>
    </div>
  );
};

export default App;
