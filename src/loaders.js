import Page from './page.js';

/**
 * Class to load an url and generate a page with the result
 */
export class UrlLoader {
    constructor(url, options = {}) {
        this.url = url;
        this.options = options;
        this.html = null;
    }

    /**
     * Go natively to the url. Used as fallback
     */
    fallback() {
        document.location = this.url;
    }

    validateResponse(response) {
        if (response.status < 200 || response.status >= 300) {
            throw new Error(`The request status code is ${response.status}`);
        }
    }

    responseIsCacheable(response) {
        const cacheControl = response.headers.get('Cache-Control');

        return !cacheControl || cacheControl.indexOf('no-cache') === -1;
    }

    /**
     * Load the page with the content of the page
     *
     * @return {Promise}
     */
    load() {
        //It's cached?
        if (this.html) {
            return new Promise((accept) => accept(new Page(this.url, parseHtml(this.html))));
        }

        return fetch(this.url, this.options)
            .then((res) => {
                this.validateResponse(res);

                if (this.url.split('#', 1).shift() !== res.url.split('#', 1).shift()) {
                    this.url = res.url;
                }

                if (!this.responseIsCacheable(res)) {
                    this.html = false;
                }

                return res;
            })
            .then((res) => res.text())
            .then((html) => {
                if (this.html !== false) {
                    this.html = html;
                }

                return new Page(this.url, parseHtml(html));
            });
    }
}

/**
 * Class to submit a form and generate a page with the result
 */
export class FormLoader extends UrlLoader {
    constructor(form, options = {}) {
        if (!options.method) {
            options.method = (form.method || 'GET').toUpperCase();
        }

        let url;

        if (options.url) {
            url = options.url;
            delete options.url;
        } else {
            url = form.action.split('?', 2).shift();
        }

        if (options.method === 'GET') {
            url += '?' + new URLSearchParams(new FormData(form));
        } else if (options.method === 'POST' && !options.body) {
            options.body = new FormData(form);
        }

        super(url, options);

        this.form = form;
    }

    validateResponse() {
        return true;
    }

    responseIsCacheable() {
        return false;
    }

    /**
     * Submit natively the form. Used as fallback
     */
    fallback() {
        this.form.submit();
    }
}

function parseHtml(html) {
    html = html.trim().replace(/^\<!DOCTYPE html\>/i, '');
    const doc = document.implementation.createHTMLDocument();
    doc.documentElement.innerHTML = html;

    return doc;
}
