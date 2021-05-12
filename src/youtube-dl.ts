import { formatPattern } from "./youtube-format.ts";

export class YoutubeDl {
  constructor(private readonly url: string) {}

  async detectPrerequisite(): Promise<
    { success: false; message: string } | { success: true }
  > {
    const [youtubeDl, ffmpeg] = await Promise.all([
      runProcess(["youtube-dl", "--version"], true),
      runProcess(["ffmpeg", "-version"], true),
    ]);
    if (!youtubeDl.status.success) {
      return { success: false, message: "youtube-dl is not in PATH." };
    }
    if (!ffmpeg.status.success) {
      return { success: false, message: "ffmpeg is not in PATH." };
    }
    return { success: true };
  }

  async listFormat(): Promise<string[]> {
    const { status, stdout, stderr } = await runPipedProcess([
      "youtube-dl",
      "--list-format",
      this.url,
    ]);

    if (!status.success) {
      throw new Error(
        `list format error. status: ${status.code}, stderr: ${
          new TextDecoder().decode(stderr)
        }`,
      );
    }

    const stdoutLines = new TextDecoder().decode(stdout).split("\n");
    return stdoutLines.filter((line) => {
      return formatPattern.test(line);
    });
  }

  async download(videoCode: string, audioCode: string): Promise<void> {
    const { status } = await runProcess([
      "youtube-dl",
      "-f",
      `${videoCode}+${audioCode}`,
      this.url,
    ], false);
    if (!status.success) {
      throw new Error(
        `download error. status: ${status.code}`,
      );
    }
  }
}

async function runProcess(cmd: string[], isDevNull: boolean): Promise<
  { status: Deno.ProcessStatus }
> {
  const process = Deno.run({
    cmd,
    stdout: isDevNull ? "null" : "inherit",
    stderr: isDevNull ? "null" : "inherit",
  });
  const status = await process.status();
  return { status };
}

async function runPipedProcess(cmd: string[]): Promise<
  { status: Deno.ProcessStatus; stdout: Uint8Array; stderr: Uint8Array }
> {
  const process = Deno.run({ cmd, stdout: "piped", stderr: "piped" });
  const [status, stdout, stderr] = await Promise.all([
    process.status(),
    process.output(),
    process.stderrOutput(),
  ]);
  process.close();
  return { status, stdout, stderr };
}
