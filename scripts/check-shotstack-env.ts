#!/usr/bin/env tsx

import { getShotstackConfig, maskKeyForLog } from "../src/lib/shotstack";

(async () => {
  try {
    const { apiKey, host } = getShotstackConfig();
    const masked = await maskKeyForLog();

    console.log("✅ Shotstack config is valid");
    console.log(`   Host: ${host}`);
    console.log(`   Key:  ${masked}`);
    console.log(`   Length: ${apiKey.length} chars`);
  } catch (err: any) {
    console.error("❌ Shotstack config error:");
    console.error(`   ${err.message}`);
    process.exit(1);
  }
})();
