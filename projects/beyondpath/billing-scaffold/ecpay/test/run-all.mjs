/**
 * ecpay 模組 — 全測試入口（Gate 1）
 * 跑法：node test/run-all.mjs    全綠 exit 0 / 任一 fail exit 1
 * 跑兩支單元測試（checkmac + create-order），任一非 0 即整體 fail。
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const suites = [
  // 第一塊
  'checkmac.test.mjs',
  'create-order.test.mjs',
  // 第二塊
  'store.test.mjs',
  'webhook.test.mjs',
  'cancel.test.mjs',
  'reauth.test.mjs',
  'receipt.test.mjs',
  'authority.test.mjs',
  // 第三塊（失敗/逆向全情境）
  'dunning.test.mjs',
  'refund.test.mjs',
  // 第四塊（真記帳：FirestoreStore REST + JWT + 409 idempotent · mock fetch）
  'firestore-store.test.mjs',
];

let allOk = true;
for (const s of suites) {
  console.log('\n########## ' + s + ' ##########');
  const r = spawnSync(process.execPath, [join(here, s)], { stdio: 'inherit' });
  if (r.status !== 0) allOk = false;
}

console.log('\n' + '#'.repeat(52));
console.log(allOk ? 'ALL SUITES GREEN ✓' : 'SOME SUITE FAILED ✗');
process.exit(allOk ? 0 : 1);
