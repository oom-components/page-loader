import Page from './page.jsm';
import UrlLoader from './url-loader.jsm';

export default class FormLoader extends UrlLoader {
    constructor(form) {
        super(form.target);
        this.form = form;
        this.cache = false;
    }

    go() {
        form.submit();
    }

    fetch() {
        let url = this.url;

        const method = (this.form.method || 'GET').toUpperCase();
        const options = { method };
        const data = new FormData(this.form);

        if (method === 'POST') {
            options.body = data;
        } else if (method === 'GET') {
            url += '?' + new URLSearchParams(data);
        }

        return fetch(url, options);
    }
}
