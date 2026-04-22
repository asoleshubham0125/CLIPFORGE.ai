import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://2b9ad372bfe318d7a8241c66b7eebd6b@o4511184882565120.ingest.us.sentry.io/4511184891215872",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});
