import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "BW Rides logo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function TwitterImage() {
  const logo = await readFile(join(process.cwd(), "public/images/bwride.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#111411",
          color: "white",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={240}
          height={240}
          alt="BW Rides"
          style={{ borderRadius: 40, padding: 8 }}
        />
        <div
          style={{
            marginTop: 24,
            fontSize: 52,
            fontWeight: 800,
            color: "#C6E31A",
          }}
        >
          BW Rides
        </div>
      </div>
    ),
    size,
  );
}
