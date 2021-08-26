/**
 * Class to handle a loaded page
 */
export default class Page {
  constructor(url, dom, status) {
    this.url = url;
    this.dom = dom;
    this.status = status;
  }

  /**
     * Performs a querySelector in the page content or document
     *
     * @param  {string} selector
     * @param  {DocumentElement} context
     *
     * @return {Node}
     */
  querySelector(selector, context = this.dom) {
    const result = context.querySelector(selector);

    if (!result) {
      throw new Error(`Not found the target "${selector}"`);
    }

    return result;
  }

  /**
     * Performs a querySelector
     *
     * @param  {string} selector
     * @param  {DocumentElement} context
     *
     * @return {Nodelist}
     */
  querySelectorAll(selector, context = this.dom) {
    const result = context.querySelectorAll(selector);

    if (!result.length) {
      throw new Error(`Not found the target "${selector}"`);
    }

    return result;
  }

  /**
     * Removes elements in the document
     *
     * @param  {String} selector
     *
     * @return {this}
     */
  removeContent(selector) {
    this.querySelectorAll(selector, document).forEach((element) =>
      element.remove()
    );

    return this;
  }

  /**
     * Replace an element in the document by an element in the page
     * Optionally, it can execute a callback to the new inserted element
     *
     * @param  {String} selector
     * @param  {Function|undefined} callback
     *
     * @return {this}
     */
  replaceContent(selector = "body", callback = undefined) {
    const content = this.querySelector(selector);

    this.querySelector(selector, document).replaceWith(content);

    if (typeof callback === "function") {
      callback(content);
    }

    return this;
  }

  /**
     * Appends the content of an element in the page in other element in the document
     * Optionally, it can execute a callback for each new inserted elements
     *
     * @param  {String} selector
     * @param  {Function|undefined} callback
     *
     * @return {this}
     */
  appendContent(target = "body", callback = undefined) {
    const content = Array.from(this.querySelector(target).childNodes);
    const fragment = document.createDocumentFragment();

    content.forEach((item) => fragment.appendChild(item));

    this.querySelector(target, document).append(fragment);

    if (typeof callback === "function") {
      content.filter((item) => item.nodeType === Node.ELEMENT_NODE).forEach(
        callback,
      );
    }

    return this;
  }

  /**
     * Change the css of the current page
     *
     * @param {string} context
     *
     * @return Promise
     */
  replaceStyles(context = "head") {
    const documentContext = this.querySelector(context, document);
    const pageContext = this.querySelector(context);
    const oldLinks = Array.from(
      documentContext.querySelectorAll('link[rel="stylesheet"]'),
    );
    const newLinks = Array.from(
      pageContext.querySelectorAll('link[rel="stylesheet"]'),
    );

    oldLinks.forEach((link) => {
      const index = newLinks.findIndex((newLink) => newLink.href === link.href);

      if (index === -1) {
        link.remove();
      } else {
        newLinks.splice(index, 1);
      }
    });

    documentContext.querySelectorAll("style").forEach((style) =>
      style.remove()
    );
    pageContext.querySelectorAll("style").forEach((style) =>
      documentContext.append(style)
    );

    return Promise.all(
      newLinks.map(
        (link) =>
          new Promise((resolve, reject) => {
            link.addEventListener("load", resolve);
            link.addEventListener("error", reject);
            documentContext.append(link);
          }),
      ),
    ).then(() => Promise.resolve(this));
  }

  /**
     * Change the scripts of the current page
     *
     * @param {string} context
     *
     * @return Promise
     */
  replaceScripts(context = "head") {
    const documentContext = this.querySelector(context, document);
    const pageContext = this.querySelector(context);
    const oldScripts = Array.from(documentContext.querySelectorAll("script"));
    const newScripts = Array.from(pageContext.querySelectorAll("script"));

    oldScripts.forEach((script) => {
      if (!script.src) {
        script.remove();
        return;
      }

      const index = newScripts.findIndex((newScript) =>
        newScript.src === script.src
      );

      if (index === -1) {
        script.remove();
      } else {
        newScripts.splice(index, 1);
      }
    });

    return Promise.all(
      newScripts.map(
        (script) =>
          new Promise((resolve, reject) => {
            const scriptElement = document.createElement("script");

            scriptElement.type = script.type || "text/javascript";
            scriptElement.defer = script.defer;
            scriptElement.async = script.async;

            if (script.src) {
              scriptElement.src = script.src;
              scriptElement.addEventListener("load", resolve);
              scriptElement.addEventListener("error", reject);
              documentContext.append(scriptElement);
              return;
            }

            scriptElement.innerText = script.innerText;
            documentContext.append(script);
            resolve();
          }),
      ),
    ).then(() => Promise.resolve(this));
  }

  /**
     * Update the state in the history
     *
     * @param {Object} state
     */
  updateState(state = null) {
    const title = this.dom.title;

    if (this.url !== document.location.href) {
      history.pushState(state, title, this.url);
    } else {
      history.replaceState(state, title);
    }

    document.title = title;

    return Promise.resolve(this);
  }

  /**
     * Reset the scroll position
     */
  resetScroll() {
    //Go to anchor if exists
    const anchor = this.url.split("#", 2)[1];

    if (anchor) {
      const target = document.getElementById(anchor);

      if (target) {
        target.scrollIntoView();
        return Promise.resolve(this);
      }
    }

    const element = document.scrollingElement;
    const value = element.style.scrollBehavior || null;
    element.style.scrollBehavior = "auto";

    return new Promise((resolve) => {
      setTimeout(() => {
        element.scrollTop = 0;
        element.style.scrollBehavior = value;
        resolve(this);
      }, 10);
    });
  }
}
