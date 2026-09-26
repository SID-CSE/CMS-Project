import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

function readEnvFile() {
  return fs.readFile(new URL("../.env", import.meta.url), "utf8")
    .then((contents) => Object.fromEntries(
      contents.split(/\r?\n/)
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index), line.slice(index + 1).trim()];
        }),
    ))
    .catch(() => ({}));
}

const env = { ...(await readEnvFile()), ...process.env };
const cloudName = env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = env.VITE_CLOUDINARY_UPLOAD_PRESET;

if (!cloudName || !uploadPreset || cloudName === "your_cloudinary_cloud_name" || uploadPreset === "your_upload_preset") {
  throw new Error("Set real VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET values in client/.env first.");
}

const names = ["hero", "moodboard", "dashboard", "social", "mobile", "email", "analytics", "delivery"];
const urls = [];
const startIndex = Math.max(0, Number(env.DEMO_MEDIA_START || 0));
const endIndex = Math.min(names.length, Number(env.DEMO_MEDIA_END || names.length));

for (let index = startIndex; index < endIndex; index += 1) {
  const filename = `task-${String(index + 1).padStart(2, "0")}-${names[index]}.svg`;
  const filePath = fileURLToPath(new URL(`../public/demo/${filename}`, import.meta.url));
  const file = await fs.readFile(filePath);
  const form = new FormData();
  form.append("file", new Blob([file], { type: "image/svg+xml" }), filename);
  form.append("upload_preset", uploadPreset);
  form.append("folder", "contify-demo");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(`${filename}: ${result?.error?.message || "Cloudinary upload failed."}`);
  urls.push(result.secure_url);
  console.log(`Uploaded ${index + 1}/8: ${filename}`);
}

if (urls.length === names.length) {
  console.log(`VITE_DEMO_MEDIA_URLS=${urls.join(",")}`);
  console.log("Add that URL list to client/.env and rebuild the client.");
} else {
  console.log(`Uploaded ${urls.length} asset(s) in this batch. Run again with DEMO_MEDIA_START=${endIndex} to resume.`);
}
