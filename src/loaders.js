import Page from './page.js';

/**
 * Class to load an url and generate a page with the result
 */
export class UrlLoader {
    constructor(url, options) {
        this.url = url;
        this.options = options;
        this.html = null;
    }

    /**
     * Performs a fetch to the url and return a promise
     *
     * @return {Promise}
     */
    fetch() {
        return fetch(this.url, this.options);
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
    load() {
        //It's cached?
        if (this.html) {
            return new Promise(accept =>
                accept(new Page(this.url, parseHtml(this.html)))
            );
        }

        return this.fetch()
            .then(res => {
                if (res.status < 200 || res.status >= 300) {
                    throw new Error(`The request status code is ${res.status}`);
                }

                this.url = res.url;

                return res;
            })
            .then(res => res.text())
            .then(html => {
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
    constructor(form) {
        let url = form.action.split('?', 2).shift();
        const method = (form.method || 'GET').toUpperCase();

        if (method === 'GET') {
            url += '?' + new URLSearchParams(new FormData(form));
        }

        super(url);

        this.html = false;
        this.method = method;
        this.form = form;
    }

    /**
     * Submit natively the form. Used as fallback
     */
    fallback() {
        this.form.submit();
    }

    /**
     * Performs a fetch with the form data and return a promise
     *
     * @return {Promise}
     */
    fetch() {
        const options = { method: this.method };

        if (this.method === 'POST') {
            options.body = new FormData(this.form);
        }

        if (this.options) {
            Object.assign(options, this.options);
        }

        return fetch(this.url, options);
    }
}

function parseHtml(html) {
    html = html.trim().replace(/^\<!DOCTYPE html\>/i, '');
    const doc = document.implementation.createHTMLDocument();
    doc.documentElement.innerHTML = html;

    return doc;
}
