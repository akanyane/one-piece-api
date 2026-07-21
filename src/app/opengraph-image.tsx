import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(
    path.join(process.cwd(), "public/luffy-flag-icon.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        background: "#f6efe0",
      }}
    >
      {/** biome-ignore lint/performance/noImgElement: required by next/og's ImageResponse renderer */}
      <img
        alt=""
        height={140}
        src={logoSrc}
        style={{ borderRadius: "50%" }}
        width={140}
      />
      <div
        style={{
          color: "#46362a",
          fontSize: 72,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        One Piece API
      </div>
      <div style={{ color: "#2f6b76", fontSize: 30 }}>
        REST API for One Piece characters, images, and canonical series data
      </div>
    </div>,
    { ...size },
  );
}
