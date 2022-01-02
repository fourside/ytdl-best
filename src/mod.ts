import { YoutubeDl } from "./youtube_dl.ts";
import {
  chooseBestId,
  isAudioFormat,
  isVideoFormat,
  parse,
} from "./youtube_format.ts";
import { parseArgs } from "./cli.ts";

export async function main(args: string[]) {
  const result = parseArgs(args);
  if (result.exit) {
    Deno.exit(result.exitCode);
  }

  try {
    const youtubeDl = new YoutubeDl(result.url, result.cookies);
    const detect = await youtubeDl.detectPrerequisite();
    if (!detect.success) {
      console.log(detect.message);
      Deno.exit(-1);
    }
    const listFormat = await youtubeDl.listFormat();
    console.info(listFormat);
    const youtubeFormats = listFormat.map((format) => parse(format));

    const videoFormats = youtubeFormats.filter(isVideoFormat).filter((format) =>
      format.extension === "mp4"
    );
    if (videoFormats.length === 0) {
      console.log("[ytdl-best] no video format");
      Deno.exit(-1);
    }
    const audioFormats = youtubeFormats.filter(isAudioFormat).filter((format) =>
      format.extension === "m4a"
    );
    if (audioFormats.length === 0) {
      console.log("[ytdl-best] no audio format");
      Deno.exit(-1);
    }
    const bestVideoId = chooseBestId(videoFormats);
    const bestAudioId = chooseBestId(audioFormats);
    console.log(
      `[ytdl-best] best video: ${bestVideoId}, best audio: ${bestAudioId}`,
    );

    await youtubeDl.download(bestVideoId, bestAudioId);
    console.log("[ytdl-best] Done! :tada:");
  } catch (error) {
    console.error("[ytdl-best]", error);
    Deno.exit(-1);
  }
}

if (import.meta.main) {
  await main(Deno.args);
}
