import Page from './page.jsm';

export default class UrlLoader {
    constructor(url) {
        this.url = url;
        this.html = '';
        this.cache = true;
    }

    fetch() {
        return fetch(this.url);
    }

    go() {
        document.location = this.url;
    }

    load(state = {}) {
        if (this.cache && this.html) {
            return new Promise(accept =>
                accept(Page.createFromHtml(this.html, this.url, state))
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
                this.html = this.cache ? html : '';
                return Page.createFromHtml(html, this.url, state);
            });
    }
}
