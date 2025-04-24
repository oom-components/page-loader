import Loader from "../src/page-loader.js";

const nav = new Loader();

nav.links(async ({ load, url, submitter }) => {
  console.log(`Link clicked: ${url}`, submitter);

  const page = await load();

  await page.replaceStyles();
  await page.replaceScripts();
  await page.replaceContent(".content");
  await page.updateState();
  await page.resetScroll();

  console.log(`Page changed to "${page.url}"`);
});

nav.downloads(async ({ load, submitter }) => {
  const prev = submitter.innerHTML;
  submitter.innerHTML = "Downloading...";
  submitter.setAttribute("disabled", "true");

  await load();

  // Simulate a download
  await new Promise((resolve) => setTimeout(resolve, 2000));

  submitter.removeAttribute("disabled");
  submitter.innerHTML = prev;
});

nav.popstate(async ({ load, url }) => {
  console.log(`Popstate event: ${url}`);

  const page = await load();

  await page.replaceStyles();
  await page.replaceScripts();
  await page.replaceContent(".content");
  await page.updateState();
  await page.resetScroll();

  console.log(`Page changed to "${page.url}"`);
});
