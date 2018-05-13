import Page from './page.jsm';
import UrlLoader from './url-loader.jsm';

export default class FormLoader extends UrlLoader {
    constructor(form) {
        let url = form.target;
        const method = (form.method || 'GET').toUpperCase();

        if (method === 'GET') {
            url += '?' + new URLSearchParams(new FormData(form));
        }

        super(url);

        this.method = method;
        this.form = form;
        this.cache = false;
    }

    go() {
        this.form.submit();
    }

    fetch() {
        const options = { method: this.method };

        if (this.method === 'POST') {
            options.body = new FormData(this.form);
        }

        return fetch(this.url, options);
    }
}
