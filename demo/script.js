import { Navigator } from "../src/navigator.js";

const transition = async (load) => {
  const page = await load();

  await page.replaceStyles();
  await page.replaceScripts();
  await page.replaceContent(".content");
  await page.updateState();
  await page.resetScroll();

  console.log(`Page changed to "${page.url}"`);
};

const navigator = new Navigator(transition);

navigator.init();
