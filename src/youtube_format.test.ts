import { assertEquals } from "std/testing";
import { parse, YoutubeFormat } from "./youtube_format.ts";

Deno.test("parse audio line webm", () => {
  // arrange
  const line =
    "249          webm       audio only tiny   48k , webm_dash container, opus @ 48k (48000Hz), 3.25MiB";
  // act
  const result = parse(line);

  // assert
  assertEquals(result.code, "249");
  assertEquals(result.extension, "webm");
  assertEquals(result.resolution, "audio only tiny 48k");
  assertEquals(result.isAudio(), false);
  assertEquals(result.isVideo(), false);
  assertEquals(result.size, 48);
});

Deno.test("parse audio line m4a", () => {
  // arrange
  const line =
    "140          m4a        audio only tiny  129k , m4a_dash container, mp4a.40.2@129k (44100Hz), 7.45MiB";
  // act
  const result = parse(line);

  // assert
  assertEquals(result.code, "140");
  assertEquals(result.extension, "m4a");
  assertEquals(result.resolution, "audio only tiny 129k");
  assertEquals(result.isAudio(), true);
  assertEquals(result.isVideo(), false);
  assertEquals(result.size, 129);
});

Deno.test("parse video line webm, video only", () => {
  // arrange
  const line =
    "244          webm       854x480    480p  351k , webm_dash container, vp9@ 351k, 30fps, video only, 23.56MiB";
  // act
  const result = parse(line);

  // assert
  assertEquals(result.code, "244");
  assertEquals(result.extension, "webm");
  assertEquals(result.resolution, "854x480 480p 351k");
  assertEquals(result.isAudio(), false);
  assertEquals(result.isVideo(), false);
  assertEquals(result.size, 480);
});

Deno.test("parse video line mp4, video only", () => {
  // arrange
  const line =
    "135          mp4        854x480    480p  844k , mp4_dash container, avc1.4d401f@ 844k, 30fps, video only, 48.56MiB";
  // act
  const result = parse(line);

  // assert
  assertEquals(result.code, "135");
  assertEquals(result.extension, "mp4");
  assertEquals(result.resolution, "854x480 480p 844k");
  assertEquals(result.isAudio(), false);
  assertEquals(result.isVideo(), true);
  assertEquals(result.size, 480);
});

Deno.test("parse video line, video only is false", () => {
  // arrange
  const line =
    "22           mp4        1280x720   720p  928k , avc1.64001F, 30fps, mp4a.40.2 (44100Hz) (best)";
  // act
  const result = parse(line);

  // assert
  assertEquals(result.code, "22");
  assertEquals(result.extension, "mp4");
  assertEquals(result.resolution, "1280x720 720p 928k");
  assertEquals(result.isAudio(), false);
  assertEquals(result.isVideo(), true);
  assertEquals(result.size, 720);
});

Deno.test("compare to sort desc", () => {
  // arrange
  const formats = [
    new YoutubeFormat("1", "mp4", "a 8p a", ""),
    new YoutubeFormat("2", "mp4", "a 7p a", ""),
    new YoutubeFormat("3", "mp4", "a 9p a", ""),
  ];
  // act
  const result = formats.slice().sort((a, b) => a.compare(b));

  // assert
  assertEquals(result[0].code, "3");
  assertEquals(result[1].code, "1");
  assertEquals(result[2].code, "2");
});
