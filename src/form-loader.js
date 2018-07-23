import UrlLoader from './url-loader.js';

/**
 * Class to submit a form and generate a page with the result
 */
export default class FormLoader extends UrlLoader {
    constructor(form) {
        let url = form.target;
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

        return fetch(this.url, options);
    }
}
