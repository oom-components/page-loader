import Page from './page.js';

/**
 * Class to load an url and generate a page with the result
 */
export default class UrlLoader {
    constructor(url) {
        this.url = url;
        this.html = null;
        this.state = {};
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
    fallback() {
        document.location = this.url;
    }

    /**
     * Load the page with the content of the page
     *
     * @return {Promise}
     */
    load(replace = false, state = null) {
        if (this.html) {
            return new Promise(accept => {
                const page = new Page(parseHtml(this.html));
                this.setState(page.dom.title, replace, state);
                accept(page);
            });
        }

        return this.fetch()
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`The request status code is ${res.status}`);
                }

                return res;
            })
            .then(res => res.text())
            .then(html => {
                if (this.html !== false) {
                    this.html = html;
                }

                const page = new Page(parseHtml(html));
                this.setState(page.dom.title, replace, state);
                return page;
            });
    }

    setState(title, replace = false, state = null) {
        document.title = title;

        if (state) {
            this.state = state;
        }

        if (this.url !== document.location.href) {
            if (replace) {
                history.replaceState(this.state, null, this.url);
            } else {
                history.pushState(this.state, null, this.url);
            }
        } else {
            history.replaceState(this.state, null, this.url);
        }
    }
}

function parseHtml(html) {
    html = html.trim().replace(/^\<!DOCTYPE html\>/i, '');
    const doc = document.implementation.createHTMLDocument();
    doc.documentElement.innerHTML = html;

    return doc;
}
