# @oom/page-loader

Javascript library to load pages using ajax and replace the content in the current page, changing also the title and the url, allowing to create beautiful page transitions. It has the following features:

* No dependencies
* Superlight. No more than 200 lines of code
* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Built with ES6, so you may need a transpiler for old browser support

## Install

Requirements:

* NPM or Yarn to install [the package and the dependencies](https://www.npmjs.com/@oom/page-loader)
* It uses [the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) for the http requests, so you can use the [fetch polyfill](https://github.com/github/fetch) to have [support for old browsers](https://caniuse.com/#feat=fetch)

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
    <title>Page title</title>
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

### JS

Use javascript for a complete experience:

```js
import Navigator from '@oom/page-loader';

//Create the navigator passing two methods: when the new page is loaded and an error handler
const nav = new Navigator(pageLoaded, pageError);

//Attach to the popstate event
window.onpopstate = () => nav.go(document.location.href);

//Attach to the click event of the links
document.querySelectorAll('.menu a').forEach(el =>
    el.addEventListener('click', e => {
        nav.go(el.href);
        e.preventDefault();
    })
);

function pageLoaded(page) {
    page.replaceContent('main') //Replace the <main> element
        .applyTitle()           //Change the title
        .applyLocation();       //Change the history location
}

function pageError(err) {
    console.error(err);
}
```

## Demo

To run the demo, just clone this repository, enter in the directory and execute:

```sh
npm install
npm start
```

You should see something in `http://localhost:8080/`

There's an online demo here: https://oom-components.github.io/page-loader/