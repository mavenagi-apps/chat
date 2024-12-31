"use client";

import { datadogRum as dd } from "@datadog/browser-rum";

const applicationId = process.env.NEXT_PUBLIC_DD_APPLICATION_ID;
const clientToken = process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN;
const env = process.env.NEXT_PUBLIC_DD_ENVIRONMENT || "disabled";

console.log(applicationId, clientToken, env);

type DDOptions = {
  sessionSampleRate: number;
  sessionReplaySampleRate: number;
  trackUserInteractions: boolean;
  trackResources: boolean;
  trackLongTasks: boolean;
  tracing: boolean;
  defaultPrivacyLevel: "mask-user-input";
};

const options = {} as DDOptions;

switch (env) {
  case "production":
  case "development":
    //TODO: restrict or make dynamic based on NEXT_PUBLIC_DD_ENVIRONMENT
    options.sessionSampleRate = 100;
    options.sessionReplaySampleRate = 20;
    options.trackUserInteractions = true;
    options.trackResources = true;
    options.trackLongTasks = true;
    options.tracing = true;
    options.defaultPrivacyLevel = "mask-user-input";
    break;
  default:
    options.sessionSampleRate = 100;
    options.sessionReplaySampleRate = 20;
    options.trackUserInteractions = true;
    options.trackResources = true;
    options.trackLongTasks = true;
    options.tracing = true;
    options.defaultPrivacyLevel = "mask-user-input";
}

if ("disabled" != env && applicationId && clientToken) {
  const {
    sessionSampleRate,
    sessionReplaySampleRate,
    trackUserInteractions,
    trackResources,
    trackLongTasks,
    tracing,
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
    tracing,
    defaultPrivacyLevel,
  });
  console.info("Initialized Datadog RUM with applicationId: %s", applicationId);
} else {
  console.warn(
    "Datadog RUM not initialized, missing NEXT_PUBLIC_DD_ENVIRONMENT, NEXT_PUBLIC_DD_APPLICATION_ID or NEXT_PUBLIC_DD_CLIENT_TOKEN",
  );
}

export default function Datadog() {
  return null;
}
