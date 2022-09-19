import Visibility from "./visibility";
import Timeline from "./timeline";
import User from "./user";
import Reaction from "./reaction";
import Channel from "./channel";
import config from "../config";
import * as request from "request-promise-native";

function generateUserId(user: User): string {
  let res: string = user.username;
  if (user.host) res += `@${user.host}`;
  else res += `@${config.host}`;
  return res;
}
function isOp(user: User): boolean {
  return config.op.indexOf(generateUserId(user)) >= 0;
}
function isBlocked(user: User): boolean {
  return config.markovSpeaking.blocked.indexOf(generateUserId(user)) >= 0;
}

function api(endpoint: string, body?: any) {
  const url = `${config.apiURL}/${endpoint}`;
  const data = JSON.stringify(
    Object.assign(
      {
        i: config.i,
      },
      body
    )
  );
  return fetch(url, {
    method: "POST",
    body: data,
    headers: config.headers,
  });
}

async function upload(file: Buffer, meta?: any) {
  const url = `${config.apiURL}/drive/files/create`;

  const res = await request.post({
    url: url,
    formData: {
      i: config.i,
      file: {
        value: file,
        options: meta,
      },
    },
    json: true,
    headers: config.headers,
  });
  return res;
}

export {
  Visibility,
  Timeline,
  User,
  Reaction,
  Channel,
  generateUserId,
  isOp,
  isBlocked,
  api,
  upload,
};
