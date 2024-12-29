"use client";

import { datadogRum as dd } from "@datadog/browser-rum";

const applicationId = process.env.DD_APPLICATION_ID;
const clientToken = process.env.DD_CLIENT_TOKEN;
const env = process.env.DD_ENVIRONMENT || "development";

type DDOptions = {
  sessionSampleRate: number;
  sessionReplaySampleRate: number;
  trackUserInteractions: boolean;
  trackResources: boolean;
  trackLongTasks: boolean;
  defaultPrivacyLevel: "mask-user-input";
};

const options = {} as DDOptions;

switch (env) {
  case "production":
  case "development":
    //TODO: restrict or make dynamic based on DD_ENVIRONMENT
    options.sessionSampleRate = 100;
    options.sessionReplaySampleRate = 20;
    options.trackUserInteractions = true;
    options.trackResources = true;
    options.trackLongTasks = true;
    options.defaultPrivacyLevel = "mask-user-input";
    break;
  default:
    options.sessionSampleRate = 100;
    options.sessionReplaySampleRate = 20;
    options.trackUserInteractions = true;
    options.trackResources = true;
    options.trackLongTasks = true;
    options.defaultPrivacyLevel = "mask-user-input";
}

if (applicationId && clientToken) {
  const {
    sessionSampleRate,
    sessionReplaySampleRate,
    trackUserInteractions,
    trackResources,
    trackLongTasks,
    defaultPrivacyLevel,
  } = options;

  // initialize Datadog RUM
  dd.init({
    applicationId,
    clientToken,
    site: "us3.datadoghq.com",
    service: "chat",
    env: "development",
    version: "0.0.1",
    sessionSampleRate,
    sessionReplaySampleRate,
    trackUserInteractions,
    trackResources,
    trackLongTasks,
    defaultPrivacyLevel,
  });
} else {
  console.info(
    "Datadog RUM not initialized. Missing DD_APPLICATION_ID or DD_CLIENT_TOKEN",
  );
}

export default function Datadog() {
  return null;
}
