const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const projectRoot = path.resolve(__dirname, "../..");

function readPng(relativePath) {
  return PNG.sync.read(fs.readFileSync(path.join(projectRoot, relativePath)));
}

describe("PWA icon metadata", () => {
  test("declares complete standalone app metadata", () => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(projectRoot, "public/manifest.webmanifest"), "utf8"),
    );

    expect(manifest).toMatchObject({
      name: "AmbuAssist",
      short_name: "AmbuAssist",
      display: "standalone",
      scope: "/",
      start_url: "/home",
      background_color: "#25311f",
      theme_color: "#25311f",
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ src: "/pwa-icon-192.png", sizes: "192x192", purpose: "any" }),
        expect.objectContaining({ src: "/pwa-icon-512.png", sizes: "512x512", purpose: "any" }),
        expect.objectContaining({ src: "/pwa-maskable-512.png", sizes: "512x512", purpose: "maskable" }),
      ]),
    );
  });

  test.each([
    ["public/apple-touch-icon-180.png", 180],
    ["public/pwa-icon-192.png", 192],
    ["public/pwa-icon-512.png", 512],
    ["public/pwa-maskable-512.png", 512],
  ])("serves an opaque %s at the declared size", (relativePath, expectedSize) => {
    const image = readPng(relativePath);
    expect(image.width).toBe(expectedSize);
    expect(image.height).toBe(expectedSize);
    let isOpaque = true;
    for (let index = 3; index < image.data.length; index += 4) {
      if (image.data[index] !== 255) {
        isOpaque = false;
        break;
      }
    }
    expect(isOpaque).toBe(true);
  });

  test("links the dedicated Apple touch icon without replacing viewport styles", () => {
    const htmlSource = fs.readFileSync(path.join(projectRoot, "app/+html.tsx"), "utf8");
    expect(htmlSource).toContain(
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180.png" />',
    );
    expect(htmlSource).toContain('name="viewport"');
    expect(htmlSource).toContain("viewport-fit=cover");
  });

  test("keeps maskable artwork centered inside the conservative safe zone", () => {
    const image = readPng("public/pwa-maskable-512.png");
    const background = image.data.slice(0, 3);
    let left = image.width;
    let top = image.height;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < image.height; y += 1) {
      for (let x = 0; x < image.width; x += 1) {
        const index = (y * image.width + x) * 4;
        const isBackground =
          image.data[index] === background[0] &&
          image.data[index + 1] === background[1] &&
          image.data[index + 2] === background[2];
        if (!isBackground) {
          left = Math.min(left, x);
          top = Math.min(top, y);
          right = Math.max(right, x);
          bottom = Math.max(bottom, y);
        }
      }
    }

    expect(left).toBeGreaterThanOrEqual(image.width * 0.18);
    expect(right).toBeLessThanOrEqual(image.width * 0.82);
    expect(top).toBeGreaterThanOrEqual(image.height * 0.28);
    expect(bottom).toBeLessThanOrEqual(image.height * 0.72);
  });
});
