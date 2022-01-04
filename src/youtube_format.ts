type VideoFormat = {
  type: "video";
  id: string;
  extension: string;
  resolution: string;
  fps: number;
  fileSize: string;
  tbr: string;
  proto: string;
  videoCodec: string;
  vbr: string;
  audioCodec: string;
  abr: string | undefined;
  asr: string | undefined;
  moreInfo: string;
};

type AudioFormat = {
  type: "audio";
  id: string;
  extension: string;
  fileSize: string;
  tbr: string;
  proto: string;
  audioCodec: string;
  abr: string;
  asr: string;
  moreInfo: string;
};

type ImageFormat = {
  type: "image";
  id: string;
  extension: string;
  resolution: string;
  proto: string;
  videoCodec: "images";
  moreInfo: "storyboard";
};

export type YoutubeFormat = VideoFormat | AudioFormat | ImageFormat;

type VideoOrAudioFormat = VideoFormat | AudioFormat;

export function parse(line: string): YoutubeFormat | ImageFormat {
  const imageResult = imagePattern.exec(line);
  if (imageResult !== null && imageResult.groups !== undefined) {
    return {
      type: "image",
      id: imageResult.groups["id"],
      extension: imageResult.groups["ext"],
      resolution: imageResult.groups["resolution"],
      proto: imageResult.groups["proto"],
      videoCodec: "images",
      moreInfo: "storyboard",
    };
  }
  const audioResult = audioOnlyPattern.exec(line);
  if (audioResult !== null && audioResult.groups !== undefined) {
    return {
      type: "audio",
      id: audioResult.groups["id"],
      extension: audioResult.groups["ext"],
      fileSize: audioResult.groups["file_size"],
      tbr: audioResult.groups["tbr"],
      proto: audioResult.groups["proto"],
      audioCodec: audioResult.groups["acodec"],
      abr: audioResult.groups["abr"],
      asr: audioResult.groups["asr"],
      moreInfo: audioResult.groups["more_info"],
    };
  }
  const videoOnlyResult = videoOnlyPattern.exec(line);
  if (videoOnlyResult !== null && videoOnlyResult.groups !== undefined) {
    return {
      type: "video",
      id: videoOnlyResult.groups["id"],
      extension: videoOnlyResult.groups["ext"],
      resolution: videoOnlyResult.groups["resolution"],
      fps: parseInt(videoOnlyResult.groups["fps"]),
      fileSize: videoOnlyResult.groups["file_size"],
      tbr: videoOnlyResult.groups["tbr"],
      proto: videoOnlyResult.groups["proto"],
      videoCodec: videoOnlyResult.groups["vcodec"],
      vbr: videoOnlyResult.groups["vbr"],
      audioCodec: "video only",
      abr: undefined,
      asr: undefined,
      moreInfo: videoOnlyResult.groups["more_info"],
    };
  }
  const videoResult = videoPattern.exec(line);
  if (videoResult !== null && videoResult.groups !== undefined) {
    return {
      type: "video",
      id: videoResult.groups["id"],
      extension: videoResult.groups["ext"],
      resolution: videoResult.groups["resolution"],
      fps: parseInt(videoResult.groups["fps"]),
      fileSize: videoResult.groups["file_size"],
      tbr: videoResult.groups["tbr"],
      proto: videoResult.groups["proto"],
      videoCodec: videoResult.groups["vcodec"],
      vbr: videoResult.groups["vbr"],
      audioCodec: videoResult.groups["acodec"],
      abr: videoResult.groups["abr"],
      asr: videoResult.groups["asr"],
      moreInfo: videoResult.groups["more_info"],
    };
  }
  throw new Error(line);
}

const videoPattern = new RegExp(
  /^(?<id>\w+) +(?<ext>\w+) +(?<resolution>.+?) +(?<fps>\d+) +\| +~? *(?<file_size>.+?) +(?<tbr>.+?) +(?<proto>\w+) +\| (?<vcodec>.+?) +(?<vbr>.+?) +(?<acodec>.+?) +(?<abr>.+?)? +(?<asr>.+?)? +(?<more_info>.+)$/,
);

const videoOnlyPattern = new RegExp(
  /^(?<id>\w+) +(?<ext>\w+) +(?<resolution>.+?) +(?<fps>\d+) +\| +~? *(?<file_size>.+?) +(?<tbr>.+?) +(?<proto>\w+) +\| (?<vcodec>.+?) +(?<vbr>.+?) +video only +(?<more_info>.+)$/,
);

const audioOnlyPattern = new RegExp(
  /^(?<id>\w+) +(?<ext>\w+) +\| +(?<file_size>.+?) +(?<tbr>.+?) +(?<proto>\w+) +\| audio only +(?<acodec>.+?) +(?<abr>.+?) +(?<asr>.+?) +(?<more_info>.+)$/,
);

const imagePattern = new RegExp(
  /^(?<id>\w+) +(?<ext>\w+) +(?<resolution>.+?) +\| +(?<proto>\w+) +\| +images +?(?<more_info>.+)$/,
);

export function isAudioFormat(format: YoutubeFormat): format is AudioFormat {
  return format.type === "audio";
}

export function isVideoFormat(format: YoutubeFormat): format is VideoFormat {
  return format.type === "video";
}

function isVideoOrAudioFormat(
  format: YoutubeFormat,
): format is VideoOrAudioFormat {
  return format.type === "video" || format.type === "audio";
}

export function chooseBestId(
  formats: YoutubeFormat[],
): YoutubeFormat["id"] {
  const sorted = [...formats]
    .filter(isVideoOrAudioFormat)
    .sort((a, b) => compareFileSize(a.fileSize, b.fileSize));
  return sorted[0].id;
}

function compareFileSize(aFileSize: string, bFileSize: string): number {
  const aSize = convertFileSizeString(aFileSize);
  const bSize = convertFileSizeString(bFileSize);
  return bSize - aSize;
}

function convertFileSizeString(fileSizeString: string): number {
  if (/KiB$/.test(fileSizeString)) {
    return parseFloat(fileSizeString.replace("KiB", "")) * 1024;
  }
  if (/MiB$/.test(fileSizeString)) {
    return parseFloat(fileSizeString.replace("MiB", "")) * 1024 * 1024;
  }
  if (/GiB$/.test(fileSizeString)) {
    return parseFloat(fileSizeString.replace("GiB", "")) * 1024 * 1024 * 1024;
  }
  throw new Error("Unsupported file size string: " + fileSizeString);
}
