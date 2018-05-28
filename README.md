# @oom/page-loader

Javascript library to load pages using ajax and replace the content in the current page. It also can change the title, the url, css and javascript. You can use this library to improve the page load speed and create beautiful page transitions. It has the following features:

* No dependencies
* Superlight
* It can be used also with forms, not only links.
* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Built with ES6, so you may need a transpiler for old browser support

Other libraries with a similar purpose are [barba.js](https://github.com/luruke/barba.js/) and [turbolinks](https://github.com/turbolinks/turbolinks). The main aim of page-loader is to be lighter and less magical, in order to be more flexible and customizable.

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
import Navigator from '@oom/page-loader';

//Create the navigator passing a callback executed when the new page is loaded
const nav = new Navigator(page => 
    page.replaceContent('main') //Replace the <main> element
        .changeTitle()          //Change the title
        .changeLocation()       //Change the history location
        .changeStyles()         //Load the new css styles defined in <head> not present currently
        .changeScripts()        //Load the new js files defined in <head> not present currently
);

//Init the navigation, capturing all clicks in links and form submits
nav.init();

//Optionally, you can filter links and forms to disable this behaviour
nav.addFilter(el => !el.classList.contains('no-loader'));

//For example, to disable forms:
nav.addFilter(el => el.tagName !== 'FORM');

//You can go manually to other url when you want
nav.go('https//example.com/page2.html');

//Or submit a form via ajax
const form = document.getElementById('my-form');
nav.submit(form);
```

### Page

A page instance contains the info about the loaded page. It has the following methods and properties:

```js
new Navigator(page => {
    page.replaceContent('#content'); //Replace an element in the document by the same element in the page
    page.appendContent('#content');  //Append the children of an element in the page to the same element in the document
    page.changeTitle();              //Change the current title by the page title
    page.changeLocation();           //Change the current url by the page url using window.pushState()
    page.changeLocation(true);       //Change the current url by the page url using window.replaceState()
    page.changeStyles();             //Change the css styles used in the new page (<link rel="stylesheet"> in <head>)
    page.changeScripts();            //Change the js styles used in the new page (<script src="..."> in <head>)
    page.querySelector('p');         //Performs a document.querySelector in the page. Throws an exception on empty result
    page.querySelectorAll('p');      //Performs a document.querySelectorAll in the page. Throws an exception on empty result

    page.url;         //Returns the page url
    page.dom;         //Returns a HTMLDocument with the content of the page
    page.title;       //Returns the title of the page
    page.state;       //Returns an object with data that you can edit/read each time you visit that page
    page.event;       //Returns the event that init the page loading ("click", "submit", "popstate", etc)

    //The page.state contains by default some variables, like "direction":
    if (page.state.direction === 'backward') {
        backwardTransition();
    } else {
        forwardTransition();
    }
});
```

By default, the `page.state` object includes the following properties:

* `page.state.direction` The direction of the new page: "backward" if the new page is older in the navigation history, "forward" otherwise.
* `page.state.html` The html code to be reused. You can remove this value to refresh the cache in the next request.
* If the new page is loaded by clicking in a `a` element, the data-* values are automatically added to the page state. For example:

```html
<a href="newpage.html" data-transition="customTransition" data-target="#container">Click me!</a>
```

```js
new Navigator(page => {
    const transitionName = page.state.transition || 'defaultTransition';
    const target = page.state.target || '#default-target';

    page.replaceContent(target)
        .changeTitle()
        .changeLocation();

    transitions[transitionName](target);
});
```


## Demo

To run the demo, just clone this repository, enter in the directory and execute:

```sh
npm install
npm start
```

You should see something in `http://localhost:8080/`

There's an online demo here: https://oom-components.github.io/page-loader/
