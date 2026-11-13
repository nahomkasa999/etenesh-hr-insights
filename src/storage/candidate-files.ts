import { randomUUID } from "node:crypto";
import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

const STORAGE_PREFIX = "neon:";

function bucketFiles(bucket: string) {
  return new Files({ adapter: neon({ bucket }) });
}

function storedObject(value: string) {
  if (!value.startsWith(STORAGE_PREFIX)) {
    return null;
  }
  const [, bucket, key] = value.split(":", 3);
  if (!(bucket && key)) {
    throw new Error("Invalid candidate file storage reference");
  }
  return { files: bucketFiles(bucket), key };
}

export async function storeCandidateFile(
  folder: "applications" | "candidate-documents",
  file: { bytes: Buffer; type: string }
): Promise<string> {
  const bucket = process.env.NEON_UPLOADS_BUCKET;
  if (!bucket) {
    return file.bytes.toString("base64");
  }
  const key = `${folder}/${randomUUID()}`;
  await bucketFiles(bucket).upload(key, file.bytes, { contentType: file.type });
  return `${STORAGE_PREFIX}${bucket}:${key}`;
}

export async function readCandidateFile(
  value: string
): Promise<Buffer<ArrayBuffer>> {
  const object = storedObject(value);
  if (!object) {
    return Buffer.from(value, "base64");
  }
  const file = await object.files.download(object.key);
  return Buffer.from(await file.arrayBuffer());
}

export async function deleteCandidateFile(value: string | null | undefined) {
  const object = value && storedObject(value);
  if (object) {
    await object.files.delete(object.key);
  }
}
