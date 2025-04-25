/**
 * Class to handle the navigation history
 */
export class Loader {
  #ignoreFilters = [];
  #handlers = [];
  #url = new URL(document.location.href);
  #init = {};
  #transitioning = false;
  cache = new Map();

  constructor() {
    // Ignore if the user pressed a modifier key
    this.ignore(({ event }) =>
      event.shiftKey || event.ctrlKey || event.altKey || event.metaKey
    );

    // Ignore if the user pressed the middle or right mouse button
    this.ignore(({ event }) => event.button !== undefined && event.button > 0);

    // Ignore if the URL is from a different origin
    this.ignore(({ url }) => url.origin !== this.#url.origin);

    // Ignore if the data-loader="off" attribute is set
    this.ignore(({ submitter }) => !!submitter?.closest('[data-loader="off"]'));

    // Capture the popstate event
    addEventListener("popstate", (event) => {
      if (this.#transitioning) {
        return;
      }

      const state = { event, url: new URL(document.location.href) };

      if (this.#ignoreFilters.some((filter) => filter(state))) {
        return;
      }

      const { defaultPrevented } = dispatchEvent("loader:beforefilter", state);

      if (!defaultPrevented) {
        const handler = this.#handlers.find((handler) =>
          handler.matches(state)
        );

        if (handler) {
          this.#handle(state, handler);
        } else if (!isSameUrl(state.url.href, this.#url.href)) {
          document.location.reload();
        } else {
          this.#url = new URL(document.location.href);
          resetScroll(this.#url);
        }
      }
    });
  }

  /**
   * Add a filter to discard elements.
   * @param {(state: object) => boolean} filter
   * @returns {void}
   */
  ignore(filter) {
    this.#ignoreFilters.push(filter);
  }

  links(transform, options) {
    this.#handlers.push(
      new UrlHandler(transform, { ...options, cache: this.cache }),
    );

    if (!this.#init.url) {
      delegate("click", "a", (event, submitter) => {
        this.#capture(event, submitter);
      });
      this.#init.url = true;
    }
  }

  downloads(transform, options) {
    this.#handlers.push(new DownloadHandler(transform, options));

    if (!this.#init.download) {
      delegate("click", "a[download]", (event, submitter) => {
        this.#capture(event, submitter);
      });
      this.#init.download = true;
    }
  }

  forms(transform, options) {
    this.#handlers.push(new FormHandler(transform, options));

    if (!this.#init.form) {
      delegate("submit", "form", (event, submitter) => {
        this.#capture(event, submitter);
      });
      this.#init.form = true;
    }
  }

  popstate(transform, options) {
    this.#handlers.push(
      new PopHandler(transform, { ...options, cache: this.cache }),
    );
  }

  #capture(event, target) {
    if (this.#transitioning) {
      return;
    }

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
      const handler = this.#handlers.find((handler) => handler.matches(state));

      if (handler) {
        this.#handle(state, handler);
      } else {
        this.#url = new URL(document.location.href);
      }
    }
  }

  /**
   * Go to other url.
   *
   * @param {Object} state
   * @return {Promise<void>}
   */
  async #handle(state, handler) {
    const { event } = state;
    this.#transitioning = true;

    try {
      const load = (newState = state) => handler.load(newState);
      const { defaultPrevented } = dispatchEvent("loader:beforeload", state);
      if (!defaultPrevented) {
        event.preventDefault();
        await handler.transition({ load, ...state });
        dispatchEvent("loader:loaded", state);
      }
    } catch (error) {
      console.error(error);
      dispatchEvent("loader:error", { error, ...state });
      handler.fallback(state);
    }

    this.#url = new URL(document.location.href);
    this.#transitioning = false;
  }
}

export default Loader;

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
   * @param  {string} selector
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
   * @param  {string} selector
   * @param  {function|undefined} callback
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
   * @param  {function|undefined} callback
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
      const index = newLinks.findIndex((newLink) =>
        isSameUrl(link.href, new URL(newLink.href, this.url).href)
      );

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
        isSameUrl(script.src, new URL(newScript.src, this.url).href)
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
   * @param {object} state
   *
   * @return {void}
   */
  updateState(state = null) {
    const title = this.dom.title;

    if (this.url.href !== document.location.href) {
      history.pushState(state, title, this.url.href);
    }

    document.title = title;
  }

  /**
   * Reset the scroll position
   * @return {Promise<void>}
   */
  async resetScroll() {
    await resetScroll(this.url);
  }
}

export class Handler {
  #options;

  constructor(transition, options = {}) {
    this.transition = transition;
    this.#options = options;
    this.#options.ignore ??= [];
  }

  get options() {
    return this.#options;
  }

  matches(state) {
    return !this.options.ignore.some((filter) => filter(state));
  }
}

/** Handler to load an URL */
export class UrlHandler extends Handler {
  constructor(transition, options) {
    super(transition, options);

    // Accept only links
    this.options.ignore.push(({ submitter }) => submitter?.tagName !== "A");

    // Ignore anchor-only changes
    this.options.ignore.push(({ url }) => isSameUrl(url.href));

    // Ignore the download attribute
    this.options.ignore.push(({ submitter }) =>
      submitter.hasAttribute("download")
    );

    // Ignore the target attribute
    this.options.ignore.push(({ submitter }) =>
      submitter.hasAttribute("target")
    );
  }

  /**
   * @returns {Page}
   */
  async load({ url }) {
    const key = url.href.split("#", 2)[0];

    if (this.options.cache?.has(key)) {
      const html = this.options.cache.get(key);
      return new Page(url, parseHtml(html), 200);
    }

    const init = { ...this.options?.fetch };
    const response = await fetch(url, init);
    const html = await response.text();

    // Cache the page
    if (response.ok) {
      const cacheControl = response.headers.get("Cache-Control");

      if (!cacheControl || cacheControl.indexOf("no-cache") === -1) {
        this.options.cache.set(key, html);
      }
    }

    return new Page(new URL(response.url), parseHtml(html), response.status);
  }

  fallback({ url }) {
    document.location = url.href;
  }
}

/** Handler to load a popstate event */
export class PopHandler extends Handler {
  constructor(transition, options) {
    super(transition, options);

    // Accept only popstate events
    this.options.ignore.push(({ event }) => event.type !== "popstate");
  }

  /**
   * @returns {Page}
   */
  async load({ url }) {
    const key = url.href.split("#", 2)[0];

    if (this.options.cache?.has(key)) {
      const html = this.options.cache.get(key);
      return new Page(url, parseHtml(html), 200);
    }

    const init = { ...this.options?.fetch };
    const response = await fetch(url, init);
    const html = await response.text();

    // Cache the page
    if (response.ok) {
      const cacheControl = response.headers.get("Cache-Control");

      if (!cacheControl || cacheControl.indexOf("no-cache") === -1) {
        this.options.cache.set(key, html);
      }
    }

    return new Page(new URL(response.url), parseHtml(html), response.status);
  }

  fallback() {
    document.location.reload();
  }
}

/** Handler to download a file */
export class DownloadHandler extends Handler {
  constructor(transition, options) {
    super(transition, options);

    // Accept only links
    this.options.ignore.push(({ submitter }) => submitter?.tagName !== "A");

    // Accept only the download attribute
    this.options.ignore.push(({ submitter }) =>
      !submitter.hasAttribute("download")
    );
  }

  /**
   * @returns {Page}
   */
  async load({ url, submitter }) {
    const init = { ...this.options?.fetch };
    const response = await fetch(url, init);
    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.dataset.loader = "off";

    const matches = response.headers.get("Content-Disposition")?.match(
      /filename="?([^";]+)/,
    );
    a.download = matches?.[1] ?? submitter.download ?? "";

    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);

    return new Page(new URL(response.url), null, response.status);
  }

  fallback({ url }) {
    document.location = url;
  }
}

/**
 * Handler to submit a form
 */
export class FormHandler extends Handler {
  constructor(transition, options) {
    super(transition, options);

    // Accept only submit buttons
    this.options.ignore.push(({ event }) => event.type !== "submit");

    // Ignore if the target attribute is present
    this.options.ignore.push(({ submitter }) =>
      submitter.formTarget || submitter.form?.target
    );
  }

  /**
   * @returns {Page}
   */
  async load({ url, submitter }) {
    const form = submitter.form;
    const init = { ...this.options?.fetch };

    init.method = (submitter.formMethod || form.method || "GET").toUpperCase();
    const action = new URL(url);

    if (init.method === "GET") {
      action.search = new URLSearchParams(new FormData(form)).toString();
    } else {
      init.body = new FormData(form);
    }

    const response = await fetch(url, init);
    const html = await response.text();

    return new Page(new URL(response.url), parseHtml(html), response.status);
  }

  fallback({ event }) {
    event.target.submit();
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
  const event = new CustomEvent(type, { detail, bubbles: true });
  const element = detail.element || document.body;
  element.dispatchEvent(event);
  return event;
}

function querySelector(selector, context) {
  const result = context.querySelector(selector);

  if (!result) {
    throw new Error(`Target "${selector}" not found`);
  }

  return result;
}

function querySelectorAll(selector, context) {
  const result = context.querySelectorAll(selector);

  if (!result.length) {
    throw new Error(`Target "${selector}" not found`);
  }

  return result;
}

function parseHtml(html) {
  html = html.trim().replace(/^\<!DOCTYPE html\>/i, "");
  const doc = document.implementation.createHTMLDocument();
  doc.documentElement.innerHTML = html;

  return doc;
}

/** Check if both urls are the same (ignoring the hash) */
function isSameUrl(url, currentUrl = document.location.href) {
  return url.split("#", 2)[0] === currentUrl.split("#", 2)[0];
}

async function resetScroll(url) {
  //Go to anchor if exists
  const anchor = url.hash.substring(1);

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
