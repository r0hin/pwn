/* 
  SIDE QUEST ‼️

  This script periodically fuzzes subdomains on large firms, and 
  sources each for ENVs left in all loaded text-based sources.
*/

import { getSites, getSubdomains } from "./core/resources";
import scan from "./core/scan";

// Entry
const run = async () => {
  const sites = getSites();

  await Promise.all(
    sites.map(async (site) => {
      const subdomains = getSubdomains();

      await Promise.all(
        subdomains.map(async (subdomain) => {
          await scan(`${subdomain}.${site}`);
        })
      );
    })
  );
};

// TODO: Every X days
run();
