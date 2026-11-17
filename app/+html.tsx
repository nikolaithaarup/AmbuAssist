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
        <link rel="icon" type="image/png" sizes="192x192" href="/pwa-icon-192.png?v=20261117" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20261117" />
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

              ::view-transition-group(root),
              ::view-transition-old(root),
              ::view-transition-new(root) {
                animation: none;
              }

              ::view-transition-old(ambuassist-route) {
                animation: ambuassist-route-old-forward 110ms cubic-bezier(0.4, 0, 1, 1) both;
              }

              ::view-transition-new(ambuassist-route) {
                animation: ambuassist-route-new-forward 190ms 45ms cubic-bezier(0.22, 1, 0.36, 1) both;
              }

              html[data-ambu-route-direction="back"]::view-transition-old(ambuassist-route) {
                animation: ambuassist-route-old-back 140ms ease-out both;
              }

              html[data-ambu-route-direction="back"]::view-transition-group(ambuassist-route) {
                animation-duration: 140ms;
              }

              html[data-ambu-route-direction="back"]::view-transition-new(ambuassist-route) {
                animation: ambuassist-route-new-back 140ms ease-out both;
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
                from { opacity: 1; }
                to { opacity: 0; }
              }

              @keyframes ambuassist-route-new-back {
                from { opacity: 0; }
                to { opacity: 1; }
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
      <style dangerouslySetInnerHTML={{ __html: `
  /* First paint before JavaScript runs; replaced only when app bootstrap finishes. */
  #synapse-startup { position: fixed; inset: 0; z-index: 2147483646; display: flex;
    align-items: center; justify-content: center; padding: 48px 24px;
    min-height: 100vh; min-height: 100dvh; box-sizing: border-box;
    background: #25311F; color: #fff; font-family: system-ui, -apple-system, sans-serif; }
  #synapse-startup * { box-sizing: border-box; }
  #synapse-startup .identity { width: 100%; max-width: 480px; text-align: center;
    display: flex; flex-direction: column; align-items: center; }
  #synapse-startup .mark { display: block; width: 136px; height: 68px;
    object-fit: cover; margin-bottom: 14px; }
  #synapse-startup .title { margin: 0; color: #fff; font-size: 32px;
    line-height: 39px; font-weight: 800; letter-spacing: -.6px; }
  #synapse-startup .subtitle { margin: 9px 0 0; color: #e1e8e7;
    font-size: 14px; line-height: 21px; }
  #synapse-startup .loading { display: flex; flex-direction: row; align-items: center;
    justify-content: center; gap: 12px; min-height: 32px; margin-top: 34px;
    color: #d3dcda; font-size: 13px; font-weight: 500; line-height: 19px; }
  #synapse-startup .studio-footer { display: flex; flex-direction: column;
    align-items: center; gap: 10px; margin-top: 46px; }
  #synapse-startup .part-of { color: #d3dcda; font-size: 11px;
    font-weight: 600; line-height: 16px; letter-spacing: 1.1px; }
  #synapse-startup .studio-logo { display: block; width: 164px;
    height: auto; max-width: 75vw; }
  #synapse-startup .spinner { display: block; width: 19px; height: 19px;
    border: 2px solid rgba(255,255,255,.22); border-top-color: #E2C76D;
    border-radius: 50%; animation: synapse-startup-spin .85s linear infinite; }
  @keyframes synapse-startup-spin { to { transform: rotate(360deg); } }
  @media (prefers-reduced-motion: reduce) {
    #synapse-startup .spinner { animation: none; }
  }
` }} />
      </head>
      <body>
        <div id="synapse-startup" aria-label="AmbuAssist starter">
          <div className="identity">
            <img className="mark" src="/pwa-icon-512.png" alt="" aria-hidden="true" width="136" height="68" />
            
            <h1 className="title">AmbuAssist</h1>
            <p className="subtitle">Kliniske værktøjer. Lige ved hånden.</p>
            <div className="loading" role="status" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <span>Kontrollerer adgang…</span>
            </div>
            <div className="studio-footer" aria-label="Part of Synapse Studio">
              <span className="part-of">Part of</span>
              <img className="studio-logo" src="/synapsestudio-logo-white.svg" alt="SynapseStudio" width="164" height="44" />
            </div>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
