# PW Page Loader

Javascript library to load pages using ajax and append the result in the current page, in order to create a infinite scrolling. It has the following features:

* Follows the progressive enhancement strategy: **if javascript fails, the web page keeps working**
* Accessible: After load the new page, the history url and title is changed. This allows to copy and share the url.
* High performance: Use the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) (and a [polyfill](https://github.com/WICG/IntersectionObserver/tree/gh-pages/polyfill)) to track the page viewed currently.

## Install

Requirements:

* NPM or Yarn to install [the package and the dependencies](https://www.npmjs.com/package/pw-page-loader)
* Webpack (or any other javascript loader)

```sh
npm install pw-page-loader
```

## Usage

### HTML

Let's start with the following html code:

```html
<ul class="images">
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
    <li><img src="http://placehold.it/500x300"></li>
</ul>

<nav class="pagination">
    <a href="page2.html">Next Page</a>
</nav>
```

### JS

Use javascript for a complete experience:

```js
import PageLoader from 'pw-page-loader';

//Init the loader
const loader = new PageLoader('.images', '.pagination a');

//Enable auto-click
loader.autoClick(true);
```

## API

### constructor

Create a new instance of `PageLoader`. The arguments are:

* `resultSelector` A string with the css selector to the list of the result
* `buttonSelector` A string with the css selector to the link to the next page
* `context` Optional context for the selectors. The default value is `document`.

### on

Register events in the page loader workflow. The available events are:

* `beforeLoadPage` Just before load a new page
* `loadPage` When a new page has been loaded
* `changePage` When the current page has changed

```js
loader.on('beforeLoadPage', url => {
    console.log('Preparing to load page', url);
});

loader.on('loadPage', page => {
    console.log('New page loaded', page);
});

loader.on('changePage', page => {
    console.log('The current page is', page);
});
```

### off

Unregister one or all callbacks of an event

```js
//unregister one callback
loader.on('beforeLoadPage', callback1);

//unregister all callbacks
loader.on('beforeLoadPage');
```

## Demo

To run the demo, just clone this repository enter in the directory and execute:

```sh
npm install
npm start
```

You should see something in `http://localhost:8080/`
