// 使い方: node source/run-tests.js  （index.html の ENGINE-START〜ENGINE-END を読み込んで検算する）
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const m = /\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//.exec(html);
const PR = new Function(m[1] + '; return PR;')();
const tc = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-cases.json'), 'utf8'));
let fail = 0;
for (const c of tc.cases) {
  const r = PR.extract(c.text, c.me, tc.conv).items;
  const probs = [];
  if (r.length !== c.expect.length) probs.push(`件数 期待${c.expect.length} 実際${r.length}`);
  c.expect.forEach((e, i) => {
    const a = r[i]; if (!a) return;
    for (const k of Object.keys(e)) {
      const av = k === 'approx' || k === 'check' ? !!a[k] : a[k];
      if (av !== e[k]) probs.push(`#${i + 1} ${k}: 期待 ${JSON.stringify(e[k])} 実際 ${JSON.stringify(av)}`);
    }
  });
  if (probs.length) fail++;
  console.log((probs.length ? 'NG ' : 'OK ') + c.id + (probs.length ? '  ' + probs.join(' / ') : `  (${r.length}件)`));
  if (probs.length) console.log('   実際:', JSON.stringify(r.map(x => [x.kind, x.who, x.what, x.due, x.basis, x.check])));
}
console.log(fail ? `失敗 ${fail}` : '全件OK');
process.exit(fail ? 1 : 0);
