import { ImageResponse } from "next/og";
import { getToolByName } from "@/lib/api";

export const runtime = "edge";

export const alt = "Tool details on agentneeds.dev";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const tool = await getToolByName(name);

  if (!tool) {
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
            background: "linear-gradient(145deg, #09090b 0%, #131316 50%, #09090b 100%)",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div style={{ fontSize: 48, fontWeight: 700, color: "#ffffff" }}>
            Tool not found
          </div>
          <div style={{ fontSize: 20, color: "#a1a1aa", marginTop: 16 }}>
            agentneeds.dev
          </div>
        </div>
      ),
      { ...size }
    );
  }

  const shortDesc = tool.short_description ?? tool.description;
  const truncatedDesc =
    shortDesc && shortDesc.length > 140
      ? shortDesc.slice(0, 137) + "..."
      : shortDesc;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          background:
            "linear-gradient(145deg, #09090b 0%, #131316 50%, #09090b 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top: branding */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 16, color: "#52525b", marginBottom: 40 }}>
            need
          </div>

          {/* Tool name */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
            }}
          >
            {tool.name}
          </div>

          {/* Short description */}
          {truncatedDesc && (
            <div
              style={{
                fontSize: 20,
                color: "#a1a1aa",
                marginTop: 20,
                lineHeight: 1.5,
                maxWidth: 900,
              }}
            >
              {truncatedDesc}
            </div>
          )}
        </div>

        {/* Bottom: badges and domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {/* Package manager badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "6px 16px",
                borderRadius: 9999,
                background: "#1c1c1f",
                border: "1px solid #27272a",
                fontSize: 14,
                color: "#a1a1aa",
              }}
            >
              {tool.package_manager}
            </div>

            {/* Category badge */}
            {tool.category && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "6px 16px",
                  borderRadius: 9999,
                  background: "#1c1c1f",
                  border: "1px solid #27272a",
                  fontSize: 14,
                  color: "#a1a1aa",
                }}
              >
                {tool.category}
              </div>
            )}
          </div>

          {/* Domain */}
          <div style={{ fontSize: 14, color: "#52525b" }}>agentneeds.dev</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
