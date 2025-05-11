import crypto from "crypto";
import fs from "fs"
import path from "path";
const rootDirName = path.resolve("./") //'C:\Users\radub_qd\intelegeinfo')
const SECRET = fs.readFileSync(path.join(rootDirName,'private.pem')) || "super_secret_key"; // Store securely in .env

export function generateHmac(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("hex");
}

export function verifyHmac(data: string, hmac: string): boolean {
  const expected = generateHmac(data);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(hmac));
}