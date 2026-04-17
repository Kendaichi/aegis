import { Command } from "@tauri-apps/plugin-shell";
import { BaseDirectory, readFile, remove, writeFile } from "@tauri-apps/plugin-fs";
import { join, tempDir } from "@tauri-apps/api/path";

const SKIP_IF_UNDER_BYTES = 20 * 1024 * 1024;

export interface CompressResult {
  file: File;
  skipped: boolean;
  originalSize: number;
  compressedSize: number;
}

export async function compressVideo(file: File): Promise<CompressResult> {
  if (file.size <= SKIP_IF_UNDER_BYTES) {
    return {
      file,
      skipped: true,
      originalSize: file.size,
      compressedSize: file.size,
    };
  }

  const stamp = Date.now();
  const ext = file.name.includes(".") ? file.name.split(".").pop()! : "mp4";
  const inputName = `aegis-${stamp}-in.${ext}`;
  const outputName = `aegis-${stamp}-out.mp4`;

  const inputBytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(inputName, inputBytes, { baseDir: BaseDirectory.Temp });

  const tmp = await tempDir();
  const inputPath = await join(tmp, inputName);
  const outputPath = await join(tmp, outputName);

  try {
    const result = await Command.sidecar("binaries/ffmpeg", [
      "-y",
      "-i", inputPath,
      "-c:v", "libx264",
      "-crf", "28",
      "-preset", "fast",
      "-vf", "scale=-2:720",
      "-c:a", "aac",
      "-b:a", "96k",
      "-movflags", "+faststart",
      outputPath,
    ]).execute();

    if (result.code !== 0) {
      throw new Error(`ffmpeg exited ${result.code}: ${result.stderr.slice(-500)}`);
    }

    const outputBytes = await readFile(outputName, { baseDir: BaseDirectory.Temp });
    const outName = file.name.replace(/\.[^.]+$/, "") + ".mp4";
    const compressed = new File([outputBytes], outName, { type: "video/mp4" });

    return {
      file: compressed,
      skipped: false,
      originalSize: file.size,
      compressedSize: compressed.size,
    };
  } finally {
    await remove(inputName, { baseDir: BaseDirectory.Temp }).catch(() => {});
    await remove(outputName, { baseDir: BaseDirectory.Temp }).catch(() => {});
  }
}
