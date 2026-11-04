import type { PropsWithChildren } from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="da">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="application-name" content="AmbuAssist" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="AmbuAssist" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#25311f" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="icon" type="image/png" sizes="192x192" href="/pwa-icon-192.png?v=20261017" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20261017" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                background-color: #10130f;
              }

              body, #root {
                min-height: 100vh;
                min-height: 100dvh;
              }

              ::view-transition-group(ambuassist-route) {
                animation-duration: 260ms;
                animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
              }

              ::view-transition-old(ambuassist-route) {
                animation: ambuassist-route-old-forward 110ms cubic-bezier(0.4, 0, 1, 1) both;
              }

              ::view-transition-new(ambuassist-route) {
                animation: ambuassist-route-new-forward 190ms 45ms cubic-bezier(0.22, 1, 0.36, 1) both;
              }

              html[data-ambu-route-direction="back"]::view-transition-old(ambuassist-route) {
                animation: ambuassist-route-old-back 110ms cubic-bezier(0.4, 0, 1, 1) both;
              }

              html[data-ambu-route-direction="back"]::view-transition-new(ambuassist-route) {
                animation: ambuassist-route-new-back 190ms 45ms cubic-bezier(0.22, 1, 0.36, 1) both;
              }

              @keyframes ambuassist-route-old-forward {
                from { opacity: 1; transform: translate3d(0, 0, 0); }
                to { opacity: 0; transform: translate3d(-4px, 0, 0); }
              }

              @keyframes ambuassist-route-new-forward {
                from { opacity: 0; transform: translate3d(6px, 0, 0); }
                to { opacity: 1; transform: translate3d(0, 0, 0); }
              }

              @keyframes ambuassist-route-old-back {
                from { opacity: 1; transform: translate3d(0, 0, 0); }
                to { opacity: 0; transform: translate3d(4px, 0, 0); }
              }

              @keyframes ambuassist-route-new-back {
                from { opacity: 0; transform: translate3d(-6px, 0, 0); }
                to { opacity: 1; transform: translate3d(0, 0, 0); }
              }

              @media (prefers-reduced-motion: reduce) {
                ::view-transition-group(ambuassist-route),
                ::view-transition-old(ambuassist-route),
                ::view-transition-new(ambuassist-route) {
                  animation-duration: 0.001ms !important;
                  animation-delay: 0ms !important;
                }
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
