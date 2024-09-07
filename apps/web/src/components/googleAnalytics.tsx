import Script from "next/script";

const GoogleAnalytics = ({ ga_id }: { ga_id: string }) => (
  <>
    <Script
      async
      src={`https://www.googletagmanager.com/gtag/js? 
      id=${ga_id}`}
    />
    <Script
      id="google-analytics"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: ignored
      dangerouslySetInnerHTML={{
        __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${ga_id}');
        `,
      }}
    />
  </>
);
export default GoogleAnalytics;
