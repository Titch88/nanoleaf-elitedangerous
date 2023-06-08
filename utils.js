const bits = require("./elite/bits.json");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const convertFlags = (flags) =>
  flags
    ? Array.from(flags.toString(2).padStart(32, "0")).map(Number).reverse()
    : "".padStart(32, "0");

const compareFlags = (oldFlags, newFlags) => {
  binaryOldFlags = convertFlags(oldFlags);
  binaryNewFlags = convertFlags(newFlags);
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
  // to be continued
};

module.exports = {
  sleep,
  handleFlags,
};
