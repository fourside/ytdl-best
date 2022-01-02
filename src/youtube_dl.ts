const mainCommand = "yt-dlp";
export class YoutubeDl {
  constructor(
    private readonly url: string,
    private readonly cookies?: string,
  ) {}

  async detectPrerequisite(): Promise<
    { success: false; message: string } | { success: true }
  > {
    const [youtubeDl, ffmpeg] = await Promise.all([
      runProcess([mainCommand, "--version"], true),
      runProcess(["ffmpeg", "-version"], true),
    ]);
    if (!youtubeDl.status.success) {
      return { success: false, message: `${mainCommand} is not in PATH.` };
    }
    if (!ffmpeg.status.success) {
      return { success: false, message: "ffmpeg is not in PATH." };
    }
    return { success: true };
  }

  async listFormat(): Promise<string[]> {
    const listCommand = [mainCommand, "--list-formats", this.url];
    if (this.cookies) {
      listCommand.splice(1, 0, "--cookies", this.cookies);
    }
    const { status, stdout, stderr } = await runPipedProcess(listCommand);

    if (!status.success) {
      throw new Error(
        `list format error. status: ${status.code}, stderr: ${
          new TextDecoder().decode(stderr)
        }`,
      );
    }

    const stdoutLines = new TextDecoder().decode(stdout).split("\n");
    const borderIndex = stdoutLines.findIndex((line) =>
      line.includes("-------------------")
    );
    return stdoutLines.slice(borderIndex + 1).filter((line) => line.length > 0);
  }

  async download(videoCode: string, audioCode: string): Promise<void> {
    const downloadCommand = [
      mainCommand,
      "-f",
      `${videoCode}+${audioCode}`,
      this.url,
    ];
    if (this.cookies) {
      downloadCommand.splice(1, 0, "--cookies", this.cookies);
    }
    const { status } = await runProcess(downloadCommand, false);
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
