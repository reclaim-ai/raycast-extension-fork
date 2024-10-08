import { config } from "dotenv";
import path from "path";

// .env files need to be in ~/.config/raycast/extensions/reclaim-ai - .env can't find them there by default.
(config({ path: path.resolve(__dirname, ".env") }));

const HEADER_KEY_PREFIX = "RAI_REQUEST_HEADER_";

export const ENV_REQUEST_HEADERS: Record<string, string> = Object.entries(process.env).reduce((headers, [key, val]) => {
  if (val && key.startsWith(HEADER_KEY_PREFIX)) headers[key.slice(HEADER_KEY_PREFIX.length)] = val;
  return headers;
}, {} as Record<string, string>);
