"use client";

/* Last resort: replaces the root layout itself, so it must render its own
   <html> and <body> and can't rely on the site's styles being loaded. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fbf8f3",
          color: "#000f16",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, margin: 0 }}>Something went wrong</h1>
          <p style={{ lineHeight: 1.6, color: "#6b7079" }}>
            The site hit an error it couldn&rsquo;t recover from. Please try
            again.
          </p>
          {error.digest && (
            <p style={{ fontSize: 12, color: "#6b7079" }}>
              Reference: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 48,
              padding: "0 28px",
              borderRadius: 999,
              border: 0,
              background: "#d69643",
              color: "#1a1005",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
