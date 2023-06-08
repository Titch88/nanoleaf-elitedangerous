import dotenv from "dotenv";
dotenv.config();
import { NanoleafClient } from "nanoleaf-client";

const firstClient = new NanoleafClient(process.env.IP_1, process.env.API_KEY_1);
const secondClient = new NanoleafClient(
  process.env.IP_2,
  process.env.API_KEY_2
);
