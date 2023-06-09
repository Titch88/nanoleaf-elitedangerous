import bits from "./elite/bits.json" assert { type: "json" };
import eventHandler from "./nanoleaf/client.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const convertFlags = (flags) =>
  flags
    ? Array.from(flags.toString(2).padStart(32, "0")).map(Number).reverse()
    : Array.from("".padStart(32, "0"));

const getActiveFlags = (newFlags) => {
  const binaryNewFlags = convertFlags(newFlags);
  const updatedFlags = binaryNewFlags
    .map((flag, idx) =>
      (flag === 1 && !bits[idx].isIgnored && !bits[idx].isNegative) ||
      (flag === 0 && !bits[idx].isIgnored && bits[idx].isNegative)
        ? bits[idx]
        : false
    )
    .filter((flag) => !!flag);
  console.log(updatedFlags);
  return updatedFlags;
};

const handleFlags = (newFlags) => {
  const activeFlags = getActiveFlags(newFlags);
  eventHandler(activeFlags);
};

export { sleep, handleFlags };
