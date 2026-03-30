import { ImageResponse } from "next/og";

export const alt = "王普霖 | Clover";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px",
          background:
            "radial-gradient(circle at 18% 22%, rgba(117,217,255,0.18), transparent 22%), linear-gradient(180deg, rgba(7,17,31,1) 0%, rgba(5,11,20,1) 100%)",
          color: "#edf4fb",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            color: "#75d9ff",
            fontSize: 24,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: "#9ff7c1",
              boxShadow: "0 0 18px rgba(159,247,193,0.8)",
            }}
          />
          Clover / AI Infra Notes
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              lineHeight: 1.04,
              maxWidth: 860,
            }}
          >
            运维开发工程师，专注 CI/CD、Kubernetes、虚拟化平台与 AI 应用落地。
          </div>
          <div
            style={{
              maxWidth: 820,
              fontSize: 30,
              lineHeight: 1.5,
              color: "#b8cadb",
            }}
          >
            王普霖的个人技术站，记录项目实践、平台工程思考与 AI 应用技术文章。
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#d8e6f4",
          }}
        >
          <div>知行合一</div>
          <div>Beijing / Infrastructure / Delivery / AI</div>
        </div>
      </div>
    ),
    size,
  );
}
