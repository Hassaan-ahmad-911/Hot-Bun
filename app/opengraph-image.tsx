import { ImageResponse } from "next/og";

export const alt = "HOT BUN — Smash burgers, crispy chicken and thick shakes. Order online or book a booth.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card, generated at build time in the brand palette. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FFC83D",
          color: "#111111",
          padding: 64,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 800,
              background: "#FFFFFF",
              border: "4px solid #111",
              borderRadius: 999,
              padding: "6px 22px",
              alignSelf: "flex-start",
              boxShadow: "6px 6px 0 #111",
            }}
          >
            HOT BUN · 48 Foundry Lane
          </div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 128, fontWeight: 900, lineHeight: 0.9, letterSpacing: -5, marginTop: 36 }}>
            <span>SMASHED.</span>
            <span style={{ color: "#D63A24" }}>STACKED.</span>
            <span>SAUCED.</span>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori (ImageResponse) only renders plain <img>. */}
        <img
          src="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&h=600&q=70"
          width={380}
          height={380}
          alt=""
          style={{ borderRadius: 999, border: "6px solid #111", boxShadow: "12px 12px 0 #111", objectFit: "cover" }}
        />
      </div>
    ),
    size,
  );
}
