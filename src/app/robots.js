export default function robots() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://seyir.app");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/messages/", "/profile/", "/refresh-cache/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
