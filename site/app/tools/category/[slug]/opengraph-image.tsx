import { ImageResponse } from "next/og";
import { listTools } from "@/lib/api";

export const runtime = "edge";
export const alt = "Category – need";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = decodeURIComponent(slug);
  const { total } = await listTools({ category, limit: 1 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
          background: "linear-gradient(145deg, #0f0f12 0%, #09090b 50%, #0a0a0e 100%)",
          color: "#ffffff",
        }}
      >
        {/* Top-left branding */}
        <div
          style={{
            position: "absolute",
            top: "48px",
            left: "80px",
            fontSize: "18px",
            color: "#71717a",
            letterSpacing: "0.05em",
          }}
        >
          need
        </div>

        {/* Category name */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.2,
          }}
        >
          {category}
        </div>

        {/* Tool count */}
        <div
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            marginTop: "16px",
          }}
        >
          {total} tools
        </div>

        {/* Bottom-right domain */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "80px",
            fontSize: "18px",
            color: "#71717a",
            letterSpacing: "0.05em",
          }}
        >
          agentneeds.dev
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
