import { assert, assertEquals } from "std/testing";
import { chooseBestId, parse, YoutubeFormat } from "./youtube_format.ts";

Deno.test("parse audio line webm", () => {
  // arrange
  const line =
    "249 webm audio only      2 |  754.19KiB    50k https | audio only         opus        50k 48k low, webm_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "audio");
  assertEquals(result.id, "249");
  assertEquals(result.extension, "webm");
  assertEquals(result.fileSize, "754.19KiB");
  assertEquals(result.tbr, "50k");
  assertEquals(result.proto, "https");
  assertEquals(result.audioCodec, "opus");
  assertEquals(result.abr, "50k");
  assertEquals(result.asr, "48k");
  assertEquals(result.moreInfo, "low, webm_dash");
});

Deno.test("parse audio line m4a", () => {
  // arrange
  const line =
    "139 m4a   audio only      2 |  722.92KiB   49k https | audio only          mp4a.40.5   49k 22k low, m4a_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "audio");
  assertEquals(result.id, "139");
  assertEquals(result.extension, "m4a");
  assertEquals(result.fileSize, "722.92KiB");
  assertEquals(result.tbr, "49k");
  assertEquals(result.proto, "https");
  assertEquals(result.audioCodec, "mp4a.40.5");
  assertEquals(result.abr, "49k");
  assertEquals(result.asr, "22k");
  assertEquals(result.moreInfo, "low, m4a_dash");
});

Deno.test("parse video line webm, video only", () => {
  // arrange
  const line =
    "278 webm  256x144     30    |    1.26MiB   87k https | vp9             87k video only          144p, webm_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "video");
  assertEquals(result.id, "278");
  assertEquals(result.extension, "webm");
  assertEquals(result.resolution, "256x144");
  assertEquals(result.fps, 30);
  assertEquals(result.fileSize, "1.26MiB");
  assertEquals(result.tbr, "87k");
  assertEquals(result.proto, "https");
  assertEquals(result.videoCodec, "vp9");
  assertEquals(result.vbr, "87k");
  assertEquals(result.audioCodec, "video only");
  assertEquals(result.abr, undefined);
  assertEquals(result.asr, undefined);
  assertEquals(result.moreInfo, "144p, webm_dash");
});

Deno.test("parse video line mp4, video only", () => {
  // arrange
  const line =
    "135 mp4   854x480     30    |    2.23MiB  155k https | avc1.4d401f    155k video only          480p, mp4_dash";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "video");
  assertEquals(result.id, "135");
  assertEquals(result.extension, "mp4");
  assertEquals(result.resolution, "854x480");
  assertEquals(result.fps, 30);
  assertEquals(result.fileSize, "2.23MiB");
  assertEquals(result.tbr, "155k");
  assertEquals(result.proto, "https");
  assertEquals(result.videoCodec, "avc1.4d401f");
  assertEquals(result.vbr, "155k");
  assertEquals(result.audioCodec, "video only");
  assertEquals(result.abr, undefined);
  assertEquals(result.asr, undefined);
  assertEquals(result.moreInfo, "480p, mp4_dash");
});

Deno.test("parse video line, not video only", () => {
  // arrange
  const line =
    "22  mp4   1280x720    30  2 | ~ 10.99MiB  744k https | avc1.64001F    744k mp4a.40.2    0k 44k 720p";
  // act
  const result = parse(line);

  // assert
  assert(result.type === "video");
  assertEquals(result.id, "22");
  assertEquals(result.extension, "mp4");
  assertEquals(result.resolution, "1280x720");
  assertEquals(result.fps, 30);
  assertEquals(result.fileSize, "10.99MiB");
  assertEquals(result.tbr, "744k");
  assertEquals(result.proto, "https");
  assertEquals(result.videoCodec, "avc1.64001F");
  assertEquals(result.vbr, "744k");
  assertEquals(result.audioCodec, "mp4a.40.2");
  assertEquals(result.abr, "0k");
  assertEquals(result.asr, "44k");
  assertEquals(result.moreInfo, "720p");
});

Deno.test("parse image line", () => {
  // arrange
  const line =
    "sb0 mhtml 160x90       1    |                  mhtml | images                                  storyboard";
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
