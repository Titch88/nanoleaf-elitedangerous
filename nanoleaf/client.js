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

let defaultStatus = {
  saturation: {
    value: 0,
  },
  brightness: {
    value: 100,
  },
  hue: { value: 0 },
};

const getCurrentLighting = async (client) => {
  const results = await Promise.all([
    client.getSaturation(),
    client.getBrightness(),
    client.getHue(),
  ]);
  sleep(300);
  return {
    saturation: results[0],
    brightness: results[1],
    hue: results[2],
  };
};

const resetLighting = async (client, { saturation, brightness, hue }) => {
  await Promise.all([
    client.setHue(hue.value),
    client.setSaturation(saturation.value),
    client.setBrightness(brightness.value),
  ]);
  await sleep(300);
};

const saveCurrentLighting = async () => {
  try {
    defaultStatus = await getCurrentLighting(firstClient);
  } catch (err) {
    defaultStatus = BASE_STATUS;
  }
};

const eventHandler = async (event, value) => {
  saveCurrentLighting();
  if (event === "Hardpoints Deployed") {
    // persistent event
    if (value) {
      await firstClient.setRgbColor(200, 0, 0);
    } else {
      resetLighting(firstClient, defaultStatus);
    }
  }
};

export default eventHandler;
