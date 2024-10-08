export const ENV_REQUEST_HEADERS: Record<string, string> = Object.entries(process.env).reduce((headers, [key, val]) => {
  if (val && key.startsWith("RAI_REQUEST_HEADER_")) headers[key] = val;
  return headers;
}, {} as Record<string, string>);
