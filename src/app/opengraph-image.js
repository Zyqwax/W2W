import { ImageResponse } from "next/og";

export const alt = "Seyir - Film Takip ve Keşif";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#09090b",
          backgroundImage: "radial-gradient(circle at 50% 30%, #27141d 0%, #09090b 70%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "48px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #e11d48, #fb7185, #e11d48)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 10px 30px -10px rgba(225, 29, 72, 0.5)",
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M7 3v18" />
              <path d="M3 7.5h4" />
              <path d="M3 12h18" />
              <path d="M3 16.5h4" />
              <path d="M17 3v18" />
              <path d="M17 7.5h4" />
              <path d="M17 16.5h4" />
            </svg>
          </div>
          <span
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#ffffff",
            }}
          >
            Seyir
          </span>
        </div>

        <p
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#f43f5e",
            margin: "0 0 16px 0",
          }}
        >
          Film Takip ve Keşif
        </p>

        <p
          style={{
            fontSize: 24,
            color: "#a1a1aa",
            maxWidth: 720,
            textAlign: "center",
            lineHeight: 1.4,
            margin: "0 0 40px 0",
          }}
        >
          İzlediğiniz ve izleyeceğiniz filmleri takip edin, listeler oluşturun ve film önerileri paylaşın.
        </p>

        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["İzleme Listesi", "İzlenenler", "Özel Listeler", "Tavsiyeler"].map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 18,
                color: "#e4e4e7",
                background: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                padding: "8px 20px",
                borderRadius: 999,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
