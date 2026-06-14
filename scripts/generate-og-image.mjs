import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "src/assets/gallery/IMG_3971 1.png");
const OUT = path.join(ROOT, "public/og-image.jpg");

const WIDTH = 1200;
const HEIGHT = 630;

await sharp(SOURCE)
  .resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" })
  .jpeg({ quality: 80, mozjpeg: true })
  .toFile(OUT);

console.log(`Wrote ${OUT} (${WIDTH}x${HEIGHT})`);
