import Script from 'next/script'

const NEWRELIC_BROWSER_ACCOUNT_ID = process.env.NEXT_PUBLIC_NEWRELIC_BROWSER_ACCOUNT_ID!
const NEWRELIC_BROWSER_AGENT_ID = process.env.NEXT_PUBLIC_NEWRELIC_BROWSER_AGENT_ID!
const NEWRELIC_BROWSER_LICENSE_KEY = process.env.NEXT_PUBLIC_NEWRELIC_BROWSER_LICENSE_KEY!
const NEWRELIC_BROWSER_APPLICATION_ID = process.env.NEXT_PUBLIC_NEWRELIC_BROWSER_APPLICATION_ID!

const configScript = `
  window.NREUM || (NREUM = {});
  NREUM.init = {
    distributed_tracing: {
      enabled: true
    },
    privacy: {
      cookies_enabled: true
    },
    ajax: {
      deny_list: ["bam.nr-data.net"]
    }
  };

  NREUM.loader_config = {
    accountID: "${NEWRELIC_BROWSER_ACCOUNT_ID}",
    trustKey: "${NEWRELIC_BROWSER_ACCOUNT_ID}",
    agentID: "${NEWRELIC_BROWSER_AGENT_ID}",
    licenseKey: "${NEWRELIC_BROWSER_LICENSE_KEY}",
    applicationID: "${NEWRELIC_BROWSER_APPLICATION_ID}"
  };

  NREUM.info = {
    beacon: "bam.nr-data.net",
    errorBeacon: "bam.nr-data.net",
    licenseKey: "${NEWRELIC_BROWSER_LICENSE_KEY}",
    applicationID: "${NEWRELIC_BROWSER_APPLICATION_ID}",
    sa: 1
  };
`

export const NewRelicHeadScript = () => {
  return (
    <>
      <Script
        id="newrelic-setup"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: configScript,
        }}
      />
      <Script
        id="newrelic-init"
        strategy="afterInteractive"
        src="https://js-agent.newrelic.com/nr-loader-spa-current.min.js"
      />
    </>
  )
}
