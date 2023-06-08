import chokidar from "chokidar";
import { promises as fs } from "fs";
import os from "os";
import { handleFlags, sleep } from "./utils.js";

const defaultJournalLocation = `${os.homedir()}\\Saved Games\\Frontier Developments\\Elite Dangerous`;

const defaultJournalName = "Status.json";

console.log("Watching for changes in ", defaultJournalLocation);

const currentStatus = {};
const currentStatusProxy = new Proxy(currentStatus, {
  set: (target, key, newFlags) => {
    if (target[key] === newFlags) {
      return false;
    }
    const oldFlags = target[key];
    target[key] = newFlags;
    // console.log("updated !");
    handleFlags(oldFlags, newFlags);

    return true;
  },
});

const main = () => {
  chokidar.watch(defaultJournalLocation).on("all", async (event, path) => {
    const newFile = path.split("\\").slice(-1);
    if (newFile.includes(defaultJournalName)) {
      try {
        await sleep(200);
        // console.log(event, path);
        const content = await fs.readFile(path);
        const opened = JSON.parse(content);
        currentStatusProxy.flags = opened.Flags;
        // console.log(opened);
      } catch (e) {
        console.log("erreur", e);
      }
    }
  });
};

main();
