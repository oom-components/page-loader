# @oom/page-loader

Javascript library to load pages using ajax and replace the content in the
current page. It changes the title, the url, css and javascript. You can use
this library to improve the page load speed and create beautiful page
transitions. It has the following features:

- No dependencies
- Superlight
- It can be used with regular links and forms
- Follows the progressive enhancement strategy: **if javascript fails, the web
  page keeps working**
- Built with ES6, so you may need a transpiler for old browser support

Other libraries with a similar purpose are
[barba.js](https://github.com/luruke/barba.js/),
[turbolinks](https://github.com/turbolinks/turbolinks) or
[highway](https://github.com/Dogstudio/highway). The main aim of page-loader is
to be lighter and less magical, in order to be more flexible and customizable.

## Install

Requirements:

- NPM or Yarn to install
  [the package and the dependencies](https://www.npmjs.com/@oom/page-loader)
- It uses
  [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
  for the http requests, so you can use a
  [fetch polyfill](https://github.com/github/fetch) and a
  [Promise polyfill](https://github.com/taylorhakes/promise-polyfill) to have
  [support for old browsers](https://caniuse.com/#feat=fetch)

```sh
npm install @oom/page-loader
```

## Usage

### HTML

Let's start with the following html code:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Page title</title>
    <link rel="stylesheet" href="styles.css">
    <script src="scripts.js"></script>
  </head>
  <body>
    <nav class="menu">
      <a href="section1.html">Section 1</a>
      <a href="section2.html">Section 2</a>
      <a href="section3.html">Section 3</a>
    </nav>
    <main class="content">
      <h1>This is the first section</h1>

      <p>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
        velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
        occaecat cupidatat non proident, sunt in culpa qui officia deserunt
        mollit anim id est laborum.
      </p>
    </main>
  </body>
</html>
```

### Javascript

Use javascript for a complete experience:

```js
import Loader from "./vendors/@oom/page-loader/src/page-loader.js";

const loader = new Loader();

// Function to load links
loader.links(async ({ event, url, submitter, load }) => {
  console.log(event); // The click event
  console.log(url); // The URL to the new address
  console.log(submitter); // The <a> object
  console.log(load); // Function to load the new page and return a Page instance

  //Load the page
  const page = await load();

  await page.replaceStyles(); //Load the new css styles defined in <head> not present currently
  await page.replaceScripts(); //Load the new js files defined in <head> not present currently
  await page.replaceContent("main"); //Replace the <main> element
  await page.updateState(); //Update the page status (change url, title etc)
  await page.resetScroll(); //Reset the scroll position
});

// Ignore links containing the .no-loader class
nav.ignore((el) => el.classList.contains("no-loader"));
```

### Forms

You can also handle form submits:

```js
// Function to load forms
loader.forms(async ({ event, url, submitter, load }) => {
  console.log(event); // The submit event
  console.log(url); // The URL to the new address
  console.log(submitter); // The pressed <button> element
  console.log(load); // Function to submit the form and return the new Page

  //Submit the form
  const page = await load();

  await page.replaceStyles(); //Load the new css styles defined in <head> not present currently
  await page.replaceScripts(); //Load the new js files defined in <head> not present currently
  await page.replaceContent("main"); //Replace the <main> element
  await page.updateState(); //Update the page status (change url, title etc)
  await page.resetScroll(); //Reset the scroll position
});
```

### Downloads

Links with the `download` attribute are ignored. But you can register a new
handler for them:

```js
// Function to download elements
loader.downloads(async ({ event, url, submitter, load }) => {
  console.log(event); // The click event
  console.log(url); // The URL to the download
  console.log(submitter); // The pressed <a> element
  console.log(load); // Function to download the element.

  submitter.innerHTML = "Downloading...";

  //Download the element
  await load();

  submitter.innerHTML = "Downloaded!";
});
```

### Popstate

You can also capture the `popstate` event (when the user click the browser
native backward/forward button). Note that in this case, the submitter doesn't
exist:

```js
nav.popstate(async ({ load, url }) => {
  const page = await load();

  await page.replaceStyles();
  await page.replaceScripts();
  await page.replaceContent(".content");
  await page.updateState();
  await page.resetScroll();
});
```

### Page

The `load` function returns a Page instance with info about the loaded page and
methods to create transitions:

```js
loader.links(async ({ event, url, submitter, load }) => {
  submitter.classList.add("loading");

  const page = await load();

  //Replace an element in the document with the same element in the page
  await page.replaceContent("#content");

  //Append the children of the loaded page to the same element in the document
  await page.appendContent("#content");

  //Remove content from the document
  await page.removeContent("#content > .unwanted");

  //Change the css styles used in the new page (<link rel="stylesheet"> in <head>).
  await page.replaceStyles();

  //Change the js styles used in the new page (<script src="..."> in <head>).
  await page.replaceScripts();

  //Performs a document.querySelector in the page. Throws an exception on empty result
  await page.querySelector("p");

  //Performs a document.querySelectorAll in the page. Throws an exception on empty result
  await page.querySelectorAll("p");

  //Runs a history.pushState changing the url and title.
  await page.updateState();

  //Reset the page scroll to top (or to the #target element)
  await page.resetScroll();

  page.dom; //HTMLDocument with the content of the page
  page.url; //The URL of the loaded page
  page.status; //The http status code of the ajax response

  submitter.classList.remove("loading");
});
```

### Events

This library triggers the following custom events:

- "loader:beforefilter"
- "loader:beforeload"
- "loader:loaded"
- "loader:error"

```js
// Add the ?ajax=true param to the URL before load it:
document.addEventListener("loader:beforeload", (event) => {
  const { url, submitter } = event.detail;

  console.log(`Preparing to load: ${url}`, submitter);
  url.searchParams.set("ajax", "true");
});
```

## Demo

There's an online demo here: https://oom-components.github.io/page-loader/
