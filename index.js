const chokidar = require("chokidar");
const fs = require("fs").promises;
const os = require("os");

const bits = require("./elite/bits.json");
const defaultJournalLocation = `${os.homedir()}\\Saved Games\\Frontier Developments\\Elite Dangerous`;

const defaultJournalName = "Status.json";

console.log("Watching for changes in ", defaultJournalLocation);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const currentStatus = {};
const currentStatusProxy = new Proxy(currentStatus, {
  set: (target, key, value) => {
    if (target[key] === value) {
      return false;
    }
    target[key] = value;
    // console.log("updated !");
    console.log(value.toString(2).padStart(32, "0"));
    const val = Array.from(value.toString(2).padStart(32, "0"))
      .map(Number)
      .reverse();
    console.log(val);
    val.forEach((flag, idx) => {
      console.log(`${bits[idx]} is ${flag === 1}`.padStart(40, " "));
    });
    return true;
  },
});

const main = () => {
  chokidar.watch(defaultJournalLocation).on("all", async (event, path) => {
    const newFile = path.split("\\").slice(-1);
    console.log(currentStatus);
    if (newFile.includes(defaultJournalName)) {
      try {
        await sleep(200);
        // console.log(event, path);
        const content = await fs.readFile(path);
        const opened = JSON.parse(content);
        currentStatusProxy.flags = opened.Flags;
        // console.log(opened);
      } catch (e) {
        console.log("erreur");
      }
    }
  });
};

main();
