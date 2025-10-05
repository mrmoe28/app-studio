#!/usr/bin/env tsx

import { getCfg, mask } from "../src/lib/shotstack";

(async () => {
  try {
    const { key, host } = getCfg();
    const masked = mask(process.env.SHOTSTACK_API_KEY);

    console.log("✅ Shotstack config is valid");
    console.log(`   Host: ${host}`);
    console.log(`   Key:  ${masked}`);
    console.log(`   Length: ${key.length} chars`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("❌ Shotstack config error:");
    console.error(`   ${message}`);
    process.exit(1);
  }
})();
