"use client";

// Last safety net: used only if the root layout itself fails. It must create its own
// <html> and <body>, and it cannot use the app styles, so it uses plain inline styles.
export default function GlobalError({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          background: "#f4f6fa",
          color: "#14284b",
        }}
      >
        <title>Something went wrong | PowerGrid BD</title>
        <main style={{ textAlign: "center", padding: "1rem" }}>
          <h1>Something went wrong</h1>
          <p>The application could not start. Please try again.</p>
          <button
            onClick={() => retry()}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              border: 0,
              background: "#14284b",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
