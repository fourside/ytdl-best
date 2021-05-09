export class YoutubeFormat {
  public videoOnly: boolean;
  public audioOnly: boolean;

  constructor(
    public code: string,
    public extension: string,
    public resolution: string,
    public note: string,
  ) {
    this.videoOnly = / video only,/.test(note);
    this.audioOnly = /^audio only /.test(resolution);
  }
}

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
