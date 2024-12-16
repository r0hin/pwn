import https from "https";
const dns = require("dns");
const { promisify } = require("util");
const resolveD = promisify(dns.resolve);
import puppeteer from "puppeteer";
import url from "url";

export default (hostname: string) => {
  return new Promise(async (resolve) => {
    // Check if it exists and is accessible
    if (!(await checkHostnameAccessibility(hostname))) {
      return resolve(false);
    }

    console.log(`✅ Surfing: ${hostname}`);

    const pathsToResources: string[] = [];

    // Get all JS this page references
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let currentUrl = `https://${hostname}`;

    while (true) {
      const response = await page.goto(currentUrl, {
        waitUntil: "networkidle0",
      });
      const newUrl = response!.url();

      if (newUrl === currentUrl) break;

      currentUrl = newUrl;

      const pageAssets = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("script")).map(
          (script) => script.src
        );
      });

      pathsToResources.push(...pageAssets);
    }

    const finalAssets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("script")).map(
        (script) => script.src
      );
    });

    pathsToResources.push(...finalAssets);
    await browser.close();

    console.log(pathsToResources.toString());

    // TODO: In parallel, analyze()

    console.log(
      `Surfed ${hostname} and found ${pathsToResources.length} assets`
    );

    resolve(true);
  });
};

const checkHostnameAccessibility = (hostname) => {
  return new Promise(async (resolve) => {
    try {
      // Step 1: DNS lookup
      await resolveD(hostname);

      // Step 2: Check URL accessibility with redirect handling
      const checkUrlStatus = (urlToCheck, redirectCount = 0) => {
        return new Promise((resolveStatus, reject) => {
          const req = https.get(urlToCheck, (res) => {
            if (
              typeof res?.statusCode !== "undefined" &&
              res?.statusCode >= 300 &&
              res?.statusCode < 400 &&
              res?.headers?.location &&
              redirectCount < 5
            ) {
              // Follow redirect (limit to 5 redirects)
              const redirectUrl = new url.URL(res.headers.location, urlToCheck)
                .href;
              return resolveStatus(
                checkUrlStatus(redirectUrl, redirectCount + 1)
              );
            } else {
              resolveStatus(res.statusCode);
            }
          });

          req.on("error", (err) => reject(err));
          req.setTimeout(5000, () => {
            req.abort();
            reject(new Error("Request timed out"));
          });
        });
      };

      const finalUrl = `https://${hostname}`;
      const status = await checkUrlStatus(finalUrl);

      resolve(status === 200);
    } catch (error) {
      resolve(false);
    }
  });
};
