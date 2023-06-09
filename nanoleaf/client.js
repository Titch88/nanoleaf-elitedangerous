import dotenv from "dotenv";
dotenv.config();
import { NanoleafClient } from "nanoleaf-client";

import { sleep } from "../utils.js";

const firstClient = new NanoleafClient(process.env.IP_1, process.env.API_KEY_1);
const secondClient = new NanoleafClient(
  process.env.IP_2,
  process.env.API_KEY_2
);

let defaultStatus = "#494949";

const getCurrentLighting = async (client) => {
  const results = await Promise.all([
    client.getSaturation(),
    client.getBrightness(),
    client.getHue(),
  ]);
  sleep(300);
  return {
    saturation: results[0].value,
    brightness: results[1].value,
    hue: results[2].value,
  };
};

const setLighting = async (client, hex) => {
  try {
    await client.setHexColor(hex);
  } catch (e) {
    console.log(e);
  }
  await sleep(300);
};

setLighting(firstClient, defaultStatus);

const handlePunctualFlags = (flags) => {
  // console.log("punctual", flags);
};

const CONTINUOUS_FLAGS_VALUES = {
  "Hardpoints Deployed": {
    value: "#8E2C00",
    isStatic: true,
  },
  Supercruise: {
    value: "#FFE35D",
    isStatic: true,
  },
  "Silent Running": {
    values: ["#7E798A", "#4E27AC"],
    interval: 1000,
    isStatic: false,
  },
  "Scooping Fuel": { value: "#00A477", isStatic: true },
  "Low Fuel ( < 25% )": { value: "#E90000", isStatic: true },
  "Over Heating ( > 100% )": {
    values: ["#FF7400", "#FF0000"],
    interval: 300,
    isStatic: false,
  },
  "Being Interdicted": { value: "#8E2C00", isStatic: true },
  "Shields Down": { value: "#DD34C2", isStatic: true },
  "Fsd Charging": {
    value: "#D60079",
    isStatic: true,
  },
  "Fsd Cooldown": {
    value: "#D60079",
    isStatic: true,
  },
  fsdJump: {
    value: "#D60079",
    isStatic: true,
  },
  "Fsd MassLocked": {
    value: "#D60079",
    isStatic: true,
  },
};

let animationPlaying = false;
let animationLoop = null;
let currentlyPlayingFlag = null;
let animationCount = 0;
let isBusy = false;

const handleLighting = async (flagValue) => {
  if (animationPlaying) {
    clearImmediate(animationLoop);
    animationPlaying = false;
    console.log("animation stopped");
  }
  await sleep(1000);
  if (flagValue.isStatic) {
    setLighting(firstClient, flagValue.value);
  } else {
    animationPlaying = true;
    animationLoop = setImmediate(async () => {
      animationCount++;
      while (animationPlaying) {
        console.log("in animation ...", animationCount);
        for (const color of flagValue.values) {
          await setLighting(firstClient, color);
          await sleep(flagValue.interval);
        }
      }
    });
  }
};

const eventHandler = async (flags) => {
  if (isBusy) return;
  isBusy = true;
  const currentFlag =
    flags.length > 0 ? flags.sort((a, b) => b.order - a.order)[0] : null;

  if (
    currentFlag &&
    currentFlag.id !== currentlyPlayingFlag &&
    CONTINUOUS_FLAGS_VALUES[currentFlag.id]
  ) {
    console.log("new flag : ", currentFlag && currentFlag.id);

    const flagValue = CONTINUOUS_FLAGS_VALUES[currentFlag.id];
    await handleLighting(flagValue);
    currentlyPlayingFlag = currentFlag.id;

    isBusy = false;
  } else {
    console.log("new flag : default");
    await setLighting(firstClient, defaultStatus);
    isBusy = false;
  }
};

export default eventHandler;
