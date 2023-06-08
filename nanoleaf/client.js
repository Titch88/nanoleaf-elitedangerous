import dotenv from "dotenv";
dotenv.config();
import { NanoleafClient } from "nanoleaf-client";

import { sleep } from "../utils.js";

const firstClient = new NanoleafClient(process.env.IP_1, process.env.API_KEY_1);
const secondClient = new NanoleafClient(
  process.env.IP_2,
  process.env.API_KEY_2
);

const BASE_STATUS = {
  saturation: {
    value: 0,
  },
  brightness: {
    value: 100,
  },
  hue: { value: 0 },
};

let defaultStatus = "#FFFFFFF";

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
  await client.setHexColor(hex);

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
    interval: 500,
    isStatic: false,
  },
  "Being Interdicted": { value: "#8E2C00", isStatic: true },
  "Shields Down": { value: "#DD34C2", isStatic: true },
};

let animationPlaying = false;
let animationLoop = null;

const handleLighting = async (flagValue) => {
  if (animationPlaying) {
    ("");
    clearImmediate(animationLoop);
    animationPlaying = false;
  }
  if (flagValue.isStatic) {
    setLighting(firstClient, flagValue.value);
  } else {
    animationPlaying = true;
    animationLoop = setImmediate(async () => {
      while (animationPlaying) {
        for (const color of flagValue.values) {
          await setLighting(firstClient, color);
          await sleep(flagValue.interval);
        }
      }
    });
  }
};

const handleContinuousFlags = async (flags) => {
  const currentFlag =
    flags.length > 0 ? flags.sort((a, b) => b.order - a.order)[0] : null;
  console.log("current continuous flag", currentFlag && currentFlag.id);

  if (currentFlag) {
    const flagValue = CONTINUOUS_FLAGS_VALUES[currentFlag.id];
    if (flagValue) {
      handleLighting(flagValue);
    } else setLighting(firstClient, defaultStatus);
  } else {
    setLighting(firstClient, defaultStatus);
  }
};

const eventHandler = async (activeFlags) => {
  handlePunctualFlags(activeFlags.filter(({ isPunctual }) => isPunctual));
  handleContinuousFlags(activeFlags.filter(({ isPunctual }) => !isPunctual));
};

export default eventHandler;
