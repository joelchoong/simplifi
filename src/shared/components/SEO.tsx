import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article" | "profile";
  ogImage?: string;
  twitterHandle?: string;
}

const SEO = ({
  title = "SimpliFi - Plan Smarter, Invest Better",
  description = "SimpliFi helps you plan smarter, invest better, and achieve financial freedom step by step. Join Malaysians on their path to financial freedom.",
  canonical = "https://simplifi.com.my",
  ogType = "website",
  ogImage = "/og-image.png",
  twitterHandle = "@SimpliFi",
}: SEOProps) => {
  const siteTitle = title.includes("SimpliFi") ? title : `${title} | SimpliFi`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
