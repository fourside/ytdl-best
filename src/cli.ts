import { YoutubeDl } from "./youtube_dl.ts";
import { chooseBestCodes, parse } from "./youtube_format.ts";

if (Deno.args.length !== 1) {
  console.log("[ytdl-best] pass one args");
  Deno.exit(-1);
}
const url = Deno.args[0];
try {
  const youtubeDl = new YoutubeDl(url);
  const detect = await youtubeDl.detectPrerequisite();
  if (!detect.success) {
    console.log(detect.message);
    Deno.exit(-1);
  }
  const listFormat = await youtubeDl.listFormat();
  console.info(listFormat);
  const youtubeFormats = listFormat.map((format) => parse(format));

  const videoFormats = youtubeFormats.filter((format) => format.isVideo());
  if (videoFormats.length === 0) {
    console.log("[ytdl-best] no video format");
    Deno.exit(-1);
  }
  const audioFormats = youtubeFormats.filter((format) => format.isAudio());
  if (audioFormats.length === 0) {
    console.log("[ytdl-best] no audio format");
    Deno.exit(-1);
  }
  const [videoCode, audioCode] = chooseBestCodes(videoFormats, audioFormats);
  console.log(`[ytdl-best] best video: ${videoCode}, best audio: ${audioCode}`);

  await youtubeDl.download(videoCode, audioCode);
  console.log("[ytdl-best] Done! :tada:");
} catch (error) {
  console.error("[ytdl-best]", error);
  Deno.exit(-1);
}
