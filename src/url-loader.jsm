import Page from './page.jsm';

/**
 * Class to load an url and generate a page with the result
 */
export default class UrlLoader {
    constructor(url) {
        this.url = url;
    }

    /**
     * Performs a fetch to the url and return a promise
     *
     * @return {Promise}
     */
    fetch() {
        return fetch(this.url);
    }

    /**
     * Go natively to the url. Used as fallback
     */
    go() {
        document.location = this.url;
    }

    /**
     * Load the page with the content of the page
     *
     * @param  {Object} state
     * @param  {Event} event
     *
     * @return {Promise}
     */
    load(state = {}, event) {
        if (state.html) {
            return new Promise(accept =>
                accept(new Page(this.url, parseHtml(state.html), state, event))
            );
        }

        return this.fetch()
            .then(res => {
                if (res.status < 200 || res.status >= 400) {
                    throw new Error(`The request status code is ${res.status}`);
                }

                return res;
            })
            .then(res => res.text())
            .then(html => {
                state.html = html;
                return new Page(this.url, parseHtml(html), state, event);
            });
    }
}

function parseHtml(html) {
    html = html.trim().replace(/^\<!DOCTYPE html\>/i, '');
    const doc = document.implementation.createHTMLDocument();
    doc.documentElement.innerHTML = html;

    return doc;
}
