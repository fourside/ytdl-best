import { parse } from "std/flags";

import { version } from "./version.ts";

type ReturnValue = {
  exit: true;
  exitCode: 0 | -1;
} | {
  exit: false;
  url: string;
};

export function parseArgs(args: string[]): ReturnValue {
  const parsed = parse(args);
  if (parsed.version || parsed.v) {
    console.log(`ytdl-best version: ${version.version}`);
    return { exit: true, exitCode: 0 };
  }
  if (parsed.help || parsed.h) {
    console.log("usage: ytdl-best ${url}");
    return { exit: true, exitCode: 0 };
  }
  if (parsed._.length !== 1) {
    console.error("usage: ytdl-best ${url}");
    return { exit: true, exitCode: -1 };
  }
  const arg = parsed._[0] + "";
  if (!/^http/.test(arg)) {
    console.error("pass url as args:", arg);
    return { exit: true, exitCode: -1 };
  }
  return { exit: false, url: arg };
}
