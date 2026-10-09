import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "BW Rides logo";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
          background: "linear-gradient(145deg, #111411 0%, #1A1F16 55%, #111411 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 720,
            height: 720,
            borderRadius: 720,
            background: "rgba(198, 227, 26, 0.16)",
            top: -220,
            right: -180,
          }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          width={280}
          height={280}
          alt="BW Rides"
          style={{
            borderRadius: 48,
            backgroundColor: "#111411",
            padding: 12,
          }}
        />
        <div
          style={{
            marginTop: 28,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: -1,
            color: "#C6E31A",
          }}
        >
          BW Rides
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 26,
            color: "rgba(255,255,255,0.82)",
          }}
        >
          Ride with confidence
        </div>
      </div>
    ),
    size,
  );
}
