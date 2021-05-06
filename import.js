export const config = {
    folder: 'scripts',
    rootUrl: 'https://raw.githubusercontent.com/latotty/bitburner-scripts/main/',
    serverPrefix: 'Llamas',
  };
  /*
   * This will import all files listed in importFiles.
   */
  export async function main(ns) {
    const downloadFileName = `${config.rootUrl}download.js`;
    await ns.wget(downloadFileName, `/${getFolder()}/download.js`);
    ns.run(`/${getFolder()}/download.js`);
  }
  
  export function getFolder() {
    return config.folder;
  }
  
  export function getServerPrefix() {
    return config.serverPrefix;
  }
  
  export function getHackScript() {
    return `/${getFolder()}/hack.js`;
  }
  