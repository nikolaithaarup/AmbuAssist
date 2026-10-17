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
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png" />
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

              [data-testid="web-route-transition"] {
                view-transition-name: ambu-route;
              }

              ::view-transition-old(root),
              ::view-transition-new(root) {
                animation: none;
              }

              ::view-transition-group(ambu-route) {
                animation-duration: 240ms;
                animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
              }

              ::view-transition-old(ambu-route),
              ::view-transition-new(ambu-route) {
                animation-duration: 240ms;
                animation-fill-mode: both;
                animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                height: 100%;
                mix-blend-mode: normal;
                width: 100%;
              }

              html[data-ambu-route-direction="forward"]::view-transition-old(ambu-route) {
                animation-name: ambu-route-old-forward;
              }

              html[data-ambu-route-direction="forward"]::view-transition-new(ambu-route) {
                animation-name: ambu-route-new-forward;
              }

              html[data-ambu-route-direction="back"]::view-transition-old(ambu-route) {
                animation-name: ambu-route-old-back;
              }

              html[data-ambu-route-direction="back"]::view-transition-new(ambu-route) {
                animation-name: ambu-route-new-back;
              }

              @keyframes ambu-route-old-forward {
                from { opacity: 1; transform: translateX(0) scale(1); }
                to { opacity: 0.7; transform: translateX(-14px) scale(0.995); }
              }

              @keyframes ambu-route-new-forward {
                from { opacity: 0.72; transform: translateX(30px) scale(0.998); }
                to { opacity: 1; transform: translateX(0) scale(1); }
              }

              @keyframes ambu-route-old-back {
                from { opacity: 1; transform: translateX(0) scale(1); }
                to { opacity: 0.72; transform: translateX(16px) scale(0.997); }
              }

              @keyframes ambu-route-new-back {
                from { opacity: 0.72; transform: translateX(-30px) scale(0.998); }
                to { opacity: 1; transform: translateX(0) scale(1); }
              }

              @media (prefers-reduced-motion: reduce) {
                [data-testid="web-route-transition"] {
                  view-transition-name: none;
                }

                ::view-transition-old(root),
                ::view-transition-new(root),
                ::view-transition-old(ambu-route),
                ::view-transition-new(ambu-route) {
                  animation: none;
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
