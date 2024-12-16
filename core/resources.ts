import * as fs from "fs";

export const getSubdomains = (): string[] => {
  try {
    const content = fs.readFileSync("resources/subdomains.txt", "utf-8");
    return content.split("\n").filter((subdomain) => subdomain.trim());
  } catch (error) {
    console.error("Error loading subdomains:", error);
    process.exit(1);
  }
};

export const getSites = (): string[] => {
  try {
    const content = fs.readFileSync("resources/sites.txt", "utf-8");
    return content.split("\n").filter((site) => site.trim());
  } catch (error) {
    console.error("Error loading sites:", error);
    process.exit(1);
  }
};
