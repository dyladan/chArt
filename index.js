var app = require("express")();
var body = require("body-parser");
var sleep = require("util").promisify(setTimeout);

let resolution = 60;
let running = false;

if (!global.gc) {
  console.log("requires --expose_gc option");
  process.exit(1);
}

console.log("pid", process.pid);

const MAX_MEMORY = 400;

async function main() {
  app.use(body.json());

  app.post("/", async (req, res) => {
    if (running) {
      return res.sendStatus(400);
    }

    res.sendStatus(202);

    running = true;

    for (const i of req.body.map(j => (MAX_MEMORY * j) / 100)) {
      await eatMem(i, resolution);
      global.gc();
    }

    running = false;
  });

  app.post("/resolution", (req, res) => {
    if (typeof req.body.resolution !== "number") {
      res.sendStatus(400);
    }
    resolution = req.body.resolution;
    res.sendStatus(202);
  });

  app.listen(1337);
  console.log("listening on", 1337);
}

async function eatMem(megs, seconds) {
  console.log(megs);
  var mem = Buffer.alloc(megs * 1000000, "!");
  await sleep(1000 * seconds);
}

main();
