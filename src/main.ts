if (Deno.args.length !== 1) {
  console.log("pass one args");
  Deno.exit(-1);
}
const url = Deno.args[0];
const listFormat = Deno.run({
  cmd: ["youtube-dl", "--list-format", url],
  stdout: "piped",
  stderr: "piped",
});
const [status, stdout, stderr] = await Promise.all([
  listFormat.status(),
  listFormat.output(),
  listFormat.stderrOutput(),
]);
listFormat.close();

if (!status.success) {
  console.log("status", status);
  console.log("stderr", new TextDecoder().decode(stderr));
  Deno.exit(-1);
}

const stdoutLines = new TextDecoder().decode(stdout).split("\n");
let flag = false;
const formats = stdoutLines.reduce<string[]>((acc, cur) => {
  if (flag && cur !== "") {
    acc.push(cur);
  }
  if (/^format code +extension +resolution note$/.test(cur)) {
    flag = true;
  }
  return acc;
}, []);

console.log(formats);
