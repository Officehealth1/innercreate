import { ImageResponse } from "next/og";

export const alt =
  "Florence D'Haemer — French Singer-Songwriter | innercreate";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1612 0%, #2a1f17 50%, #1e1814 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          position: "relative",
        }}
      >
        {/* Decorative line */}
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: "#c4956a",
            marginBottom: 32,
            display: "flex",
          }}
        />
        {/* Name */}
        <div
          style={{
            fontSize: 72,
            color: "#f0e6d6",
            fontWeight: 700,
            letterSpacing: "-1px",
            display: "flex",
          }}
        >
          Florence D&apos;Haemer
        </div>
        {/* Descriptor */}
        <div
          style={{
            fontSize: 24,
            color: "#c4956a",
            marginTop: 16,
            letterSpacing: "6px",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Singer · Songwriter · Storyteller
        </div>
        {/* Decorative line */}
        <div
          style={{
            width: 80,
            height: 2,
            backgroundColor: "#c4956a",
            marginTop: 32,
            display: "flex",
          }}
        />
        {/* URL */}
        <div
          style={{
            fontSize: 18,
            color: "#a89279",
            marginTop: 24,
            display: "flex",
          }}
        >
          innercreate.com
        </div>
      </div>
    ),
    { ...size }
  );
}
