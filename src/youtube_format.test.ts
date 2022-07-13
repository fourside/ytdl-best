import { assert, assertEquals } from "std/testing";
import { chooseBestId, parse, YoutubeFormat } from "./youtube_format.ts";

Deno.test("parse audio line webm", () => {
  // arrange
  const line =
    "249 webm                 |    4.38MiB    53k https | audio only         opus        53k 48000Hz low, webm_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "audio");
  assertEquals(result.id, "249");
  assertEquals(result.extension, "webm");
  assertEquals(result.fileSize, "4.38MiB");
  assertEquals(result.tbr, "53k");
  assertEquals(result.proto, "https");
  assertEquals(result.audioCodec, "opus");
  assertEquals(result.abr, "53k");
  assertEquals(result.asr, "48000Hz");
  assertEquals(result.moreInfo, "low, webm_dash");
});

Deno.test("parse audio line m4a", () => {
  // arrange
  const line =
    "140 m4a   audio only     |   10.63MiB   129k https | audio only         mp4a.40.2  129k 44100Hz medium, m4a_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "audio");
  assertEquals(result.id, "140");
  assertEquals(result.extension, "m4a");
  assertEquals(result.fileSize, "10.63MiB");
  assertEquals(result.tbr, "129k");
  assertEquals(result.proto, "https");
  assertEquals(result.audioCodec, "mp4a.40.2");
  assertEquals(result.abr, "129k");
  assertEquals(result.asr, "44100Hz");
  assertEquals(result.moreInfo, "medium, m4a_dash");
});

Deno.test("parse video line webm, video only", () => {
  // arrange
  const line =
    "244 webm  854x480     25 |   36.05MiB   439k https | vp9           439k video only              480p, webm_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "video");
  assertEquals(result.id, "244");
  assertEquals(result.extension, "webm");
  assertEquals(result.resolution, "854x480");
  assertEquals(result.fps, 25);
  assertEquals(result.fileSize, "36.05MiB");
  assertEquals(result.tbr, "439k");
  assertEquals(result.proto, "https");
  assertEquals(result.videoCodec, "vp9");
  assertEquals(result.vbr, "439k");
  assertEquals(result.audioCodec, "video only");
  assertEquals(result.abr, undefined);
  assertEquals(result.asr, undefined);
  assertEquals(result.moreInfo, "480p, webm_dash");
});

Deno.test("parse video line mp4, video only", () => {
  // arrange
  const line =
    "135 mp4   854x480     25 |   27.15MiB   330k https | avc1.4d401e   330k video only              480p, mp4_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "video");
  assertEquals(result.id, "135");
  assertEquals(result.extension, "mp4");
  assertEquals(result.resolution, "854x480");
  assertEquals(result.fps, 25);
  assertEquals(result.fileSize, "27.15MiB");
  assertEquals(result.tbr, "330k");
  assertEquals(result.proto, "https");
  assertEquals(result.videoCodec, "avc1.4d401e");
  assertEquals(result.vbr, "330k");
  assertEquals(result.audioCodec, "video only");
  assertEquals(result.abr, undefined);
  assertEquals(result.asr, undefined);
  assertEquals(result.moreInfo, "480p, mp4_dash");
});

Deno.test("parse video line, not video only", () => {
  // arrange
  const line =
    "22  mp4   1280x720    25 | ~ 59.45MiB   706k https | avc1.64001F   706k mp4a.40.2    0k 44100Hz 720p";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "video");
  assertEquals(result.id, "22");
  assertEquals(result.extension, "mp4");
  assertEquals(result.resolution, "1280x720");
  assertEquals(result.fps, 25);
  assertEquals(result.fileSize, "59.45MiB");
  assertEquals(result.tbr, "706k");
  assertEquals(result.proto, "https");
  assertEquals(result.videoCodec, "avc1.64001F");
  assertEquals(result.vbr, "706k");
  assertEquals(result.audioCodec, "mp4a.40.2");
  assertEquals(result.abr, "0k");
  assertEquals(result.asr, "44100Hz");
  assertEquals(result.moreInfo, "720p");
});

Deno.test("parse image line", () => {
  // arrange
  const line =
    "sb0 mhtml 160x90         |                   mhtml | images                                     storyboard";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "image");
  assertEquals(result.id, "sb0");
  assertEquals(result.extension, "mhtml");
  assertEquals(result.resolution, "160x90");
  assertEquals(result.proto, "mhtml");
  assertEquals(result.videoCodec, "images");
  assertEquals(result.moreInfo, "storyboard");
});

Deno.test("chooseBestId", () => {
  // arrange
  const videoFormats: YoutubeFormat[] = [
    {
      type: "video",
      id: "1",
      extension: "mp4",
      resolution: "640x360",
      proto: "https",
      fps: 30,
      tbr: "300k",
      abr: undefined,
      asr: undefined,
      vbr: "300k",
      fileSize: "139.28MiB",
      audioCodec: "video only",
      videoCodec: "avc1.4d401e",
      moreInfo: "",
    },
    {
      type: "video",
      id: "2",
      extension: "mp4",
      resolution: "640x360",
      proto: "https",
      fps: 30,
      tbr: "300k",
      abr: undefined,
      asr: undefined,
      vbr: "300k",
      fileSize: "1.33GiB",
      audioCodec: "video only",
      videoCodec: "avc1.4d401e",
      moreInfo: "",
    },
    {
      type: "video",
      id: "3",
      extension: "mp4",
      resolution: "640x360",
      proto: "https",
      fps: 30,
      tbr: "300k",
      abr: undefined,
      asr: undefined,
      vbr: "300k",
      fileSize: "27.15KiB",
      audioCodec: "video only",
      videoCodec: "avc1.4d401e",
      moreInfo: "",
    },
  ];
  // act
  const result = chooseBestId(videoFormats);

  // assert
  assertEquals(result, "2");
});
