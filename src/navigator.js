import { FormLoader, UrlLoader } from "./loaders.js";
import download from "./download.js";

/**
 * Class to handle the navigation history
 */
export default class Navigator {
  constructor(handler) {
    this.url = document.location.href;
    this.loaders = [];
    this.handler = handler;
    this.downloadHandler;
    this.events = { beforeFilter: [], beforeLoad: [], load: [], error: [] };
    this.filters = [
      (el, url) =>
        url &&
        url.indexOf(
            `${document.location.protocol}//${document.location.host}`,
          ) === 0,
      (el, url) => el.tagName === "FORM" || !isAnchor(url),
      (el, url, submitter) => !el.target && (!submitter || submitter.target),
      (el) => !el.hasAttribute("download"),
    ];
  }

  /**
     * Assign a handler to a download action
     * @param {Function} handler
     */
  download(handler) {
    this.downloadHandler = handler;
  }

  /**
     * Add a filter to discard some urls and forms.
     * It must be a function accepting two arguments: the element clicked and url
     *
     * @param {Function} filter
     *
     * @return {this}
     */
  addFilter(filter) {
    this.filters.push(filter);

    return this;
  }

  /**
     * Add an event
     *
     * @param {string} event
     * @param {Function} handler
     *
     * @return {this}
     */
  on(event, handler) {
    this.events[event].push(handler);

    return this;
  }

  /**
     * Trigger an event
     *
     * @param {string} event
     * @param  {...any} args
     *
     * @return {bool}
     */
  trigger(event, ...args) {
    return this.events[event].every((handler) => handler(...args) !== false);
  }

  /**
     * Init the navigator, attach the events to capture the history changes
     *
     * @return {this}
     */
  init() {
    delegate("click", "a", (event, link) => {
      if (isIgnored(event, link)) {
        return;
      }

      if (
        this.trigger("beforeFilter", link, link.href) &&
        this.filters.every((filter) => filter(link, link.href))
      ) {
        this.go(link.href, event, link);
        event.preventDefault();
      }

      if (link.hasAttribute("download") && this.downloadHandler) {
        this.downloadHandler(
          () => download(link.href, link.download),
          event,
          link,
        );
        event.preventDefault();
      }
    });

    let getSubmitter;

    if (window.SubmitEvent) {
      getSubmitter = (event) => event.submitter;
    } else {
      let submitter;
      delegate(
        "click",
        'form button,input[type="submit"]',
        (event, button) => (submitter = button),
      );

      getSubmitter = (event, form) => {
        if (!submitter) {
          return null;
        }

        if (form.contains(submitter)) {
          const tmp = submitter;
          submitter = null;
          return tmp;
        }

        submitter = null;
        return null;
      };
    }

    delegate("submit", "form", (event, form) => {
      const submitter = getSubmitter(event, form);
      const url = getFormUrl(form, submitter);

      if (
        !isIgnored(event, submitter || form) &&
        this.trigger("beforeFilter", form, url, submitter) &&
        this.filters.every((filter) => filter(form, url, submitter))
      ) {
        this.submit(form, event, { url }, submitter);
        event.preventDefault();
      }
    });

    window.addEventListener("popstate", (event) => {
      if (!isAnchor(this.url)) {
        this.go(document.location.href, event);
      }
    });

    this.loaders.push(new UrlLoader(document.location.href));

    return this;
  }

  /**
     * Go to other url.
     *
     * @param  {string} url
     * @param  {Event} event
     * @param  {Object} options
     * @param  {HTMLElement} element
     * @param  {HTMLElement} submitter
     *
     * @return {Promise}
     */
  go(url, event, options = {}, element, submitter) {
    url = resolve(url);

    let loader = this.loaders.find((loader) => loader.url === url);

    if (!loader) {
      loader = new UrlLoader(url, options);
      this.loaders.push(loader);
    }

    return this.load(loader, event, element, submitter);
  }

  /**
     * Submit a form via ajax
     *
     * @param  {HTMLFormElement} form
     * @param  {Event} event
     * @param  {Object} options
     * @param  {HTMLElement} submitter
     *
     * @return {Promise}
     */
  submit(form, event, options = {}, submitter) {
    options.url = options.url || getFormUrl(form, submitter);

    if (submitter) {
      if (submitter.name) {
        options.body = new FormData(form);
        options.body.append(submitter.name, submitter.value);
      }

      if (submitter.hasAttribute("formmethod")) {
        options.method = submitter.formMethod.toUpperCase();
      }
    }

    return this.load(new FormLoader(form, options), event, form, submitter);
  }

  /**
     * Execute a page loader
     *
     * @param  {UrlLoader|FormLoader} loader
     * @param  {Event} event
     * @param  {HTMLElement} element
     * @param  {HTMLElement} submitter
     *
     * @return {Promise}
     */
  load(loader, event, element, submitter) {
    this.url = loader.url;

    const onError = (err) => {
      if (!this.trigger("error", err, element, loader, event, submitter)) {
        return;
      }

      loader.fallback();
    };

    if (!this.trigger("beforeLoad", element, loader, event, submitter)) {
      return;
    }

    try {
      const result = this.handler(
        () => loader.load(),
        event,
        element,
        submitter,
      );

      if (result instanceof Promise) {
        return result.catch(onError).then(() =>
          this.trigger("beforeLoad", element, loader, event, submitter)
        );
      } else {
        this.trigger("load", element, loader, event, submitter);
      }
    } catch (err) {
      onError(err);
      return Promise.resolve();
    }
  }
}

const link = document.createElement("a");

function resolve(url) {
  link.setAttribute("href", url);
  return link.href;
}

function delegate(event, selector, callback) {
  document.addEventListener(
    event,
    function (event) {
      for (
        let target = event.target;
        target && target != this;
        target = target.parentNode
      ) {
        if (target.matches(selector)) {
          callback.call(target, event, target);
          break;
        }
      }
    },
    true,
  );
}

function isAnchor(url) {
  return url.split("#", 1).shift() ===
    document.location.href.split("#", 1).shift();
}

function getFormUrl(form, submitter) {
  return resolve(
    submitter && submitter.hasAttribute("formaction")
      ? submitter.formAction
      : form.action,
  );
}
function isIgnored(event, element) {
  return (
    event.shiftKey ||
    event.ctrlKey ||
    event.altKey ||
    event.metaKey ||
    element.matches('[data-loader="off"], [data-loader="off"] *')
  );
}
