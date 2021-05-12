export class YoutubeFormat {
  public readonly size: number;
  private readonly audioOnly: boolean;

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

  compare(other: YoutubeFormat): number {
    return this.size - other.size;
  }

  isAudio(): boolean {
    return this.audioOnly && this.extension === "m4a";
  }

  isVideo(): boolean {
    return !this.audioOnly && this.extension === "mp4";
  }
}

const videoSizePattern = new RegExp(/^.+? (?<size>\d+)p .+$/, "u");
const audioSizePattern = new RegExp(/^audio only tiny (?<size>\d+)k$/);

export const formatPattern = new RegExp(
  "^(?<code>.+?) +(?<extension>.+?) +(?<resolution>.+?) , +(?<note>.+)$",
  "u",
);

export function parse(line: string): YoutubeFormat {
  const result = formatPattern.exec(line);
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

export function chooseBestCodes(
  videoFormats: YoutubeFormat[],
  audioFormats: YoutubeFormat[],
): [string, string] {
  const video = chooseBest(videoFormats);
  const audio = chooseBest(audioFormats);
  return [video.code, audio.code];
}

function chooseBest(formats: YoutubeFormat[]): YoutubeFormat {
  const sorted = formats.slice().sort((a, b) => a.compare(b));
  return sorted[0];
}
