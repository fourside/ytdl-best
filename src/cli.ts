import { parse } from "https://deno.land/std@0.96.0/flags/mod.ts";

import { version } from "./version.ts";

export function parseArgs(args: string[]): string {
  const parsed = parse(args);
  if (parsed.version || parsed.v) {
    console.log(`ytdl-best version: ${version.version}`);
    Deno.exit(0);
  }
  if (parsed.help || parsed.h) {
    console.log("usage: ytdl-best ${url}");
    Deno.exit(0);
  }
  if (parsed._.length !== 1) {
    console.error("usage: ytdl-best ${url}");
    Deno.exit(-1);
  }
  const arg = parsed._[0] + "";
  if (!/^http/.test(arg)) {
    console.error("pass url as args:", arg);
    Deno.exit(-1);
  }
  return arg;
}
