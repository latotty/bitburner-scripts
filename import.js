export async function main(ns) {
  const rootUrl = 'https://raw.githubusercontent.com/latotty/bitburner-scripts/main/';
  const downloadFileName = `${rootUrl}download.js?t=${Date.now()}`;
  await ns.wget(downloadFileName, `/scripts/llwz/download.js`);
  ns.run(`/scripts/llwz/download.js`, 1, `--rootUrl=${rootUrl}`);
}
