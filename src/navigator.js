import UrlLoader from './url-loader.js';
import FormLoader from './form-loader.js';

/**
 * Class to handle the navigation history
 */
export default class Navigator {
    constructor(handler) {
        this.loaders = [];
        this.handler = handler;
        this.filters = [
            (el, url) =>
                url &&
                url.indexOf(
                    `${document.location.protocol}//${document.location.host}`
                ) === 0,
            (el, url) => url !== document.location.href,
            el => !el.target
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
            if (this.filters.every(filter => filter(link, link.href))) {
                this.go(link.href, Object.assign({}, link.dataset), event);
                event.preventDefault();
            }
        });

        delegate('submit', 'form', (event, form) => {
            const url = resolve(form.action);

            if (this.filters.every(filter => filter(form, url))) {
                this.submit(form, Object.assign({}, form.dataset), event);
                event.preventDefault();
            }
        });

        window.onpopstate = event =>
            this.go(
                document.location.href,
                Object.assign(event.state || {}),
                event
            );

        this.loaders.push(new UrlLoader(document.location.href));

        return this;
    }

    /**
     * Go to other url. If the url is the previous visited, performs a history.back()
     *
     * @param  {string} url
     * @param  {Object} state
     * @param  {Event} event
     *
     * @return {Promise|void}
     */
    go(url, state = {}, event) {
        url = resolve(url);

        let loader = this.loaders.find(loader => loader.url === url);

        if (!loader) {
            loader = new UrlLoader(url);
            this.loaders.push(loader);
        }

        return this.load(loader, state, event);
    }

    /**
     * Submit a form via ajax
     *
     * @param  {HTMLFormElement} form
     * @param  {Object} state
     * @param  {Event} event
     *
     * @return {Promise}
     */
    submit(form, state = {}, event) {
        return this.load(new FormLoader(form), state, event);
    }

    /**
     * Execute a page loader
     *
     * @param  {UrlLoader|FormLoader} loader
     * @param  {Object} state
     * @param  {Event} event
     *
     * @return {Promise}
     */
    load(loader, state = {}, event) {
        try {
            return this.handler(loader, state, event);
        } catch (err) {
            console.error(err);
            loader.fallback();

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
        function(event) {
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
        true
    );
}
