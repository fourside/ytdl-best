import { assertEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { parse } from "./youtube-format.ts";

Deno.test("parse audio line", () => {
  // arrange
  const line =
    "249          webm       audio only tiny   48k , webm_dash container, opus @ 48k (48000Hz), 3.25MiB";
  // act
  const result = parse(line);

  // assert
  assertEquals(result.code, "249");
  assertEquals(result.extension, "webm");
  assertEquals(result.resolution, "audio only tiny 48k");
  assertEquals(result.audioOnly, true);
  assertEquals(result.size, 48);
});

Deno.test("parse video line, video only", () => {
  // arrange
  const line =
    "244          webm       854x480    480p  351k , webm_dash container, vp9@ 351k, 30fps, video only, 23.56MiB";
  // act
  const result = parse(line);

  // assert
  assertEquals(result.code, "244");
  assertEquals(result.extension, "webm");
  assertEquals(result.resolution, "854x480 480p 351k");
  assertEquals(result.audioOnly, false);
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
  assertEquals(result.audioOnly, false);
  assertEquals(result.size, 720);
});
