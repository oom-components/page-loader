import { UrlLoader, FormLoader } from './loaders.js';

/**
 * Class to handle the navigation history
 */
export default class Navigator {
    constructor(handler) {
        this.loaders = [];
        this.handler = handler;
        this.filters = [
            (el, url) => url && url.indexOf(`${document.location.protocol}//${document.location.host}`) === 0,
            (el, url) => el.tagName === 'FORM' || url !== document.location.href,
            (el) => !el.target,
        ];
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
     * Init the navigator, attach the events to capture the history changes
     *
     * @return {this}
     */
    init() {
        delegate('click', 'a', (event, link) => {
            if (
                !event.shiftKey &&
                !event.ctrlKey &&
                !event.altKey &&
                !event.metaKey &&
                this.filters.every((filter) => filter(link, link.href))
            ) {
                this.go(link.href, event);
                event.preventDefault();
            }
        });

        let latestBtn = null;

        delegate('click', 'form button,input[type="submit"]', (event, button) => (latestBtn = button));

        delegate('submit', 'form', (event, form) => {
            if (latestBtn) {
                if (!form.contains(latestBtn)) {
                    latestBtn = null;
                } else if (latestBtn.formTarget) {
                    latestBtn = null;
                    return;
                }
            }

            const url = resolve(latestBtn && latestBtn.formAction ? latestBtn.formAction : form.action);

            if (this.filters.every((filter) => filter(form, url))) {
                const options = { url };

                if (latestBtn) {
                    if (latestBtn.name) {
                        options.body = new FormData(form);
                        options.body.append(latestBtn.name, latestBtn.value);
                    }
                    if (latestBtn.formMethod) {
                        options.method = latestBtn.formMethod.toUpperCase();
                    }
                }

                this.submit(form, event, options);
                event.preventDefault();
            }

            latestBtn = null;
        });

        window.addEventListener('popstate', (event) => this.go(document.location.href, event));

        this.loaders.push(new UrlLoader(document.location.href));

        return this;
    }

    /**
     * Go to other url.
     *
     * @param  {string} url
     * @param  {Event} event
     * @param  {Object} options
     *
     * @return {Promise}
     */
    go(url, event, options = {}) {
        url = resolve(url);

        let loader = this.loaders.find((loader) => loader.url === url);

        if (!loader) {
            loader = new UrlLoader(url, options);
            this.loaders.push(loader);
        }

        return this.load(loader, event);
    }

    /**
     * Submit a form via ajax
     *
     * @param  {HTMLFormElement} form
     * @param  {Event} event
     * @param  {Object} options
     *
     * @return {Promise}
     */
    submit(form, event, options = {}) {
        return this.load(new FormLoader(form, options), event);
    }

    /**
     * Execute a page loader
     *
     * @param  {UrlLoader|FormLoader} loader
     * @param  {Event} event
     *
     * @return {Promise}
     */
    load(loader, event) {
        const onError = (err) => {
            console.error(err);
            loader.fallback();
        };

        try {
            const result = this.handler(() => loader.load(), event);

            if (result instanceof Promise) {
                return result.catch(onError);
            }
        } catch (err) {
            onError(err);
            return Promise.resolve();
        }
    }
}

const link = document.createElement('a');

function resolve(url) {
    link.setAttribute('href', url);
    return link.href;
}

function delegate(event, selector, callback) {
    document.addEventListener(
        event,
        function (event) {
            for (let target = event.target; target && target != this; target = target.parentNode) {
                if (target.matches(selector)) {
                    callback.call(target, event, target);
                    break;
                }
            }
        },
        true
    );
}
