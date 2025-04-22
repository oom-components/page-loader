/**
 * Class to handle the navigation history
 */
export class Navigator {
  #ignoreFilters = [];
  #handlers = [];
  #url = new URL(document.location.href);

  constructor(handler) {
    if (typeof handler === "function") {
      handler = new UrlHandler(handler);
    }

    if (handler) {
      this.handle(handler);
    }

    // Ignore if the user pressed a modifier key
    this.ignore(({ event }) =>
      event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
    );

    // Ignore if the user pressed the middle or right mouse button
    this.ignore(({ event }) => event.button !== undefined && event.button > 0);

    // Ignore if the URL is from a different origin
    this.ignore(({ url }) => url.origin !== this.#url.origin);

    // Ignore if the URL is the same (only the hash changed)
    this.ignore(({ url }) =>
      url.href.split("#", 1).shift() === this.#url.href.split("#", 1).shift()
    );

    // Ignore if the data-loader="off" attribute is set
    this.ignore(({ submitter }) => !!submitter.closest('[data-loader="off"]'));
  }

  /**
   * Add a filter to discard elements.
   * @param {({event: Event, url: URL, submitter: Element}) => boolean} filter
   * @returns {void}
   */
  ignore(filter) {
    this.#ignoreFilters.push(filter);
  }

  handle(handler) {
    this.#handlers.push(handler);
  }

  #capture(event, target) {
    const submitter = target.tagName === "FORM" ? event.submitter : target;

    const url = target.tagName === "FORM"
      ? new URL(submitter?.formAction || target.action)
      : new URL(target.href);

    const state = { url, event, submitter };

    if (this.#ignoreFilters.some((filter) => filter(state))) {
      return;
    }

    const { defaultPrevented } = dispatchEvent("loader:beforefilter", state);

    if (!defaultPrevented) {
      this.go(state);
    }
  }

  /**
   * Init the navigator, attach the events to capture the history changes
   *
   * @return {void}
   */
  init() {
    delegate("click", "a", (event, submitter) => {
      this.#capture(event, submitter);
    });

    delegate("submit", "form", (event, form) => {
      this.#capture(event, submitter);
    });

    window.addEventListener("popstate", (event) => {
      // this.go(document.location.href, event);
    });
  }

  /**
   * Go to other url.
   *
   * @param {Object} state
   * @return {Promise<void>}
   */
  async go(state) {
    const { url, event, submitter } = state;

    for (const handler of this.#handlers) {
      if (!handler.matches(state)) {
        continue;
      }

      try {
        event.preventDefault();
        await handler.transition(() => handler.load(state));
      } catch (error) {
        handler.fallback(state);
        dispatchEvent("loader:error", {
          error,
          url,
          event,
          submitter,
        });
      }
    }
  }
}

export default Navigator;

/**
 * Class to handle a loaded page
 */
export class Page {
  constructor(url, dom, status) {
    this.url = url;
    this.dom = dom;
    this.status = status;
  }

  /**
   * Remove elements in the document
   *
   * @param  {String} selector
   *
   * @return {void}
   */
  removeContent(selector) {
    querySelectorAll(selector, document).forEach((element) => element.remove());
  }

  /**
   * Replace an element in the document by an element in the page
   * Optionally, it can execute a callback to the new inserted element
   *
   * @param  {String} selector
   * @param  {Function|undefined} callback
   *
   * @return {void}
   */
  replaceContent(selector = "body", callback = undefined) {
    const content = querySelector(selector, this.dom);

    querySelector(selector, document).replaceWith(content);

    if (typeof callback === "function") {
      callback(content);
    }
  }

  /**
   * Appends the content of an element in the page in other element in the document
   * Optionally, it can execute a callback for each new inserted elements
   *
   * @param  {string} selector
   * @param  {Function|undefined} callback
   *
   * @return {void}
   */
  appendContent(target = "body", callback = undefined) {
    const content = Array.from(querySelector(target, this.dom).childNodes);
    const fragment = document.createDocumentFragment();

    content.forEach((item) => fragment.appendChild(item));

    querySelector(target, document).append(fragment);

    if (typeof callback === "function") {
      content.filter((item) => item.nodeType === Node.ELEMENT_NODE).forEach(
        callback,
      );
    }
  }

  /**
   * Change the css of the current page
   *
   * @param {string} context
   *
   * @return {Promise<void>}
   */
  async replaceStyles(context = "head") {
    const documentContext = querySelector(context, document);
    const pageContext = querySelector(context, this.dom);
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

    await Promise.all(
      newLinks.map(
        (link) =>
          new Promise((resolve, reject) => {
            link.addEventListener("load", resolve);
            link.addEventListener("error", reject);
            documentContext.append(link);
          }),
      ),
    );
  }

  /**
   * Change the scripts of the current page
   *
   * @param {string} context
   *
   * @return {Promise<void>}
   */
  async replaceScripts(context = "head") {
    const documentContext = querySelector(context, document);
    const pageContext = querySelector(context, this.dom);
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

    await Promise.all(
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
    );
  }

  /**
   * Update the state in the history
   *
   * @param {Object} state
   *
   * @return {void}
   */
  updateState(state = null) {
    const title = this.dom.title;

    if (this.url !== document.location.href) {
      history.pushState(state, title, this.url);
    } else {
      history.replaceState(state, title);
    }

    document.title = title;
  }

  /**
   * Reset the scroll position
   * @return {Promise<void>}
   */
  async resetScroll() {
    //Go to anchor if exists
    const anchor = this.url.split("#", 2)[1];

    if (anchor) {
      const target = document.getElementById(anchor);

      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    const element = document.scrollingElement;
    const value = element.style.scrollBehavior || null;
    element.style.scrollBehavior = "auto";

    await new Promise((resolve) => {
      setTimeout(() => {
        element.scrollTop = 0;
        element.style.scrollBehavior = value;
        resolve(this);
      }, 10);
    });
  }
}

export class Handler {
  #ignoreFilters = [];

  constructor(transition) {
    this.transition = transition;
  }

  matches(state) {
    return !this.#ignoreFilters.some((filter) => filter(state));
  }

  ignore(filter) {
    this.#ignoreFilters.push(filter);
  }
}

/** Class to load an url and generate a page with the result */
export class UrlHandler extends Handler {
  #options;

  constructor(transition, options) {
    super(transition);
    this.#options = options;

    // Accept only links
    this.ignore(({ submitter }) => submitter.tagName !== "A");

    // Ignore the download attribute
    this.ignore(({ submitter }) => submitter.hasAttribute("download"));

    // Ignore the target attribute
    this.ignore(({ submitter }) => submitter.hasAttribute("target"));
  }

  async load({ url }) {
    const response = await fetch(url, this.#options?.fetch);
    const html = await response.text();

    return new Page(response.url, parseHtml(html), response.status);
  }

  fallback({ url }) {
    document.location = url;
  }

  async go(url, event) {
  }
}

function delegate(event, selector, callback) {
  document.addEventListener(
    event,
    function (event) {
      const target = event.target.closest(selector);
      if (target) {
        callback.call(target, event, target);
      }
    },
    true,
  );
}

function dispatchEvent(type, detail) {
  const event = new CustomEvent(type, { detail });
  const element = detail.element || document.body;
  element.dispatchEvent(event);
  return event;
}

function querySelector(selector, context) {
  const result = context.querySelector(selector);

  if (!result) {
    throw new Error(`Not found the target "${selector}"`);
  }

  return result;
}

function querySelectorAll(selector, context) {
  const result = context.querySelectorAll(selector);

  if (!result.length) {
    throw new Error(`Not found the target "${selector}"`);
  }

  return result;
}
