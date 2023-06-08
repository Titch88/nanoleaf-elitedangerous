import bits from "./elite/bits.json" assert { type: "json" };
import eventHandler from "./nanoleaf/client.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const convertFlags = (flags) =>
  flags
    ? Array.from(flags.toString(2).padStart(32, "0")).map(Number).reverse()
    : Array.from("".padStart(32, "0"));

const compareFlags = (oldFlags, newFlags) => {
  const binaryOldFlags = convertFlags(oldFlags);
  const binaryNewFlags = convertFlags(newFlags);
  console.log(binaryNewFlags);
  const updatedFlags = binaryNewFlags
    .map((flag, idx) =>
      flag !== binaryOldFlags[idx] ? { flag: bits[idx], value: flag } : false
    )
    .filter((flag) => !!flag);
  console.log(updatedFlags);
  return updatedFlags;
};

const handleFlags = (oldFlags, newFlags) => {
  const updatedFlags = compareFlags(oldFlags, newFlags);
  for (let f of updatedFlags) {
    eventHandler(f.flag, f.value);
  }
  // to be continued
};

export { sleep, handleFlags };
