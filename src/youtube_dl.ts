export class YoutubeDl {
  constructor(
    private readonly url: string,
    private readonly cookies?: string,
  ) {}

  async detectPrerequisite(): Promise<
    { success: false; message: string } | { success: true }
  > {
    const [youtubeDl, ffmpeg] = await Promise.all([
      runCommand("yt-dlp", ["--version"], "null", "null"),
      runCommand("ffmpeg", ["-version"], "null", "null"),
    ]);
    if (!youtubeDl.success) {
      return { success: false, message: `yt-dlp is not in PATH.` };
    }
    if (!ffmpeg.success) {
      return { success: false, message: "ffmpeg is not in PATH." };
    }
    return { success: true };
  }

  async listFormat(): Promise<string[]> {
    const commandArgs = ["--list-formats", this.url];
    if (this.cookies) {
      commandArgs.splice(1, 0, "--cookies", this.cookies);
    }
    const { success, stdout, stderr, code } = await runCommand(
      "yt-dlp",
      commandArgs,
    );

    if (!success) {
      throw new Error(
        `list format error. status: ${code}, stderr: ${
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
    const commandArgs = [
      "-f",
      `${videoCode}+${audioCode}`,
      this.url,
    ];
    if (this.cookies) {
      commandArgs.splice(1, 0, "--cookies", this.cookies);
    }
    const { success, code } = await runCommand(
      "yt-dlp",
      commandArgs,
      "inherit",
      "inherit",
    );
    if (!success) {
      throw new Error(
        `download error. status: ${code}`,
      );
    }
  }
}

async function runCommand(
  mainCommand: string,
  commandArgs: string[],
  stdout: Deno.CommandOptions["stdout"] = "piped",
  stderr: Deno.CommandOptions["stderr"] = "piped",
): Promise<Deno.CommandOutput> {
  const command = new Deno.Command(mainCommand, {
    args: commandArgs,
    stdout,
    stderr,
  });
  return await command.output();
}
