import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, rgba(7,17,31,1) 0%, rgba(9,21,38,1) 100%)",
          color: "#edf4fb",
          fontSize: 28,
          fontWeight: 700,
          border: "1px solid rgba(117,217,255,0.24)",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, rgba(117,217,255,0.2), rgba(159,247,193,0.28))",
            boxShadow: "0 0 18px rgba(117,217,255,0.35)",
          }}
        >
          C
        </div>
      </div>
    ),
    size,
  );
}
