# @oom/page-loader

Javascript library to load pages using ajax and replace the content in the current page. It changes the title, the url, css and javascript. You can use this library to improve the page load speed and create beautiful page transitions. It has the following features:

* No dependencies
* Superlight
* It can be used with regular links and forms
* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Built with ES6, so you may need a transpiler for old browser support

Other libraries with a similar purpose are [barba.js](https://github.com/luruke/barba.js/), [turbolinks](https://github.com/turbolinks/turbolinks) or [highway](https://github.com/Dogstudio/highway). The main aim of page-loader is to be lighter and less magical, in order to be more flexible and customizable.

## Install

Requirements:

* NPM or Yarn to install [the package and the dependencies](https://www.npmjs.com/@oom/page-loader)
* It uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for the http requests, so you can use a [fetch polyfill](https://github.com/github/fetch) and a [Promise polyfill](https://github.com/taylorhakes/promise-polyfill) to have [support for old browsers](https://caniuse.com/#feat=fetch)

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

        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
    </main>
</body>
</html>
```

### Javascript

Use javascript for a complete experience:

```js
import Navigator from './vendors/@oom/page-loader/src/navigator.js';

const nav = new Navigator(async (load, event) => {
    //Load the page
    const page = await load();

    await page.replaceStyles();         //Load the new css styles defined in <head> not present currently
    await page.replaceScripts();        //Load the new js files defined in <head> not present currently
    await page.replaceContent('main');  //Replace the <main> element
    await page.updateState();           //Update the page status (change url, title etc)
});

//Init the navigation, capturing all clicks in links and form submits
nav.init();

//Optionally, you can filter links and forms to disable this behaviour
nav.addFilter(el => !el.classList.contains('no-loader'));

//For example, to disable forms:
nav.addFilter(el => el.tagName !== 'FORM');

//Subscribe to events
nav.on('error', err => console.error(err));

//You can go manually to other url when you want
nav.go('https//example.com/page2.html');

//Or submit a form via ajax
const form = document.getElementById('my-form');
nav.submit(form);

//And handle downloads (links with download attribute)
nav.download(async (download, event, link) => {
    link.classList.add('downloading');
    await download();
    link.classList.remove('downloading');
})
```

### Page

A page instance contains the info about the loaded page. It has the following methods and properties:

```js
const nav = new Navigator(async (load, event, target, submitter) => {
    //By clicking a link, the target is the A element
    //By submitting a form, the target is the form but you can get the submitter element (the button being pressed)
    const trigger = submitter || target;

    trigger.classList.add('loading');

    const page = await load()

    //Replace an element in the document with the same element in the page
    await page.replaceContent('#content')

    //Append the children of the loaded page to the same element in the document
    await page.appendContent('#content')

    //Remove content from the document
    await page.removeContent('#content > .unwanted')
    
    //Change the css styles used in the new page (<link rel="stylesheet"> in <head>).
    await page.replaceStyles()

    //Change the js styles used in the new page (<script src="..."> in <head>).
    await page.replaceScripts()

    //Performs a document.querySelector in the page. Throws an exception on empty result
    await page.querySelector('p')

    //Performs a document.querySelectorAll in the page. Throws an exception on empty result
    await page.querySelectorAll('p')

    //Runs a history.pushState changing the url and title.
    await page.updateState()

    page.dom; //HTMLDocument with the content of the page
    page.url; //The url of the loaded page

    trigger.classList.remove('loading');
})
```

By default, the `loader.html` object includes the property `html` with the html code to be reused.

### Events

- beforeFilter (element, url, [submitter])
- beforeLoad  (element, url, [submitter])
- load  (element, loader, event, [submitter])
- error (error, element, loader, event, [submitter])

## Demo

To run the demo, just clone this repository, enter in the directory and execute:

```sh
npm install
npm start
```

You should see something in `http://localhost:8080/`

There's an online demo here: https://oom-components.github.io/page-loader/
