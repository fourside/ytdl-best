export class YoutubeFormat {
  public readonly audioOnly: boolean;
  public readonly size: number;

  constructor(
    public readonly code: string,
    public readonly extension: string,
    public readonly resolution: string,
    public readonly note: string,
  ) {
    this.audioOnly = /^audio only /.test(resolution);
    const sizePattern = this.audioOnly ? audioSizePattern : videoSizePattern;
    const result = sizePattern.exec(resolution);
    if (result === null || result.groups === undefined) {
      this.size = 0;
      return;
    }
    this.size = parseInt(result.groups["size"]);
  }
}

const videoSizePattern = new RegExp(/^.+? (?<size>\d+)p .+$/, "u");
const audioSizePattern = new RegExp(/^audio only tiny (?<size>\d+)k$/);

const pattern = new RegExp(
  "^(?<code>.+?) +(?<extension>.+?) +(?<resolution>.+?) , +(?<note>.+)$",
  "u",
);

export function parse(line: string): YoutubeFormat {
  const result = pattern.exec(line);
  if (result === null) {
    throw new Error(`fail to parse: ${line}`);
  }
  if (!result.groups) {
    throw new Error(`fail to parse: ${line}`);
  }
  const code = result.groups["code"];
  const extension = result.groups["extension"];
  const resolution = result.groups["resolution"].replace(/ {2,}/g, " ");
  const note = result.groups["note"];

  return new YoutubeFormat(code, extension, resolution, note);
}
