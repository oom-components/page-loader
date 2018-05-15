import UrlLoader from './url-loader.jsm';
import FormLoader from './form-loader.jsm';

export default class Navigator {
    constructor(handler, errorHandler) {
        this.loaders = {};
        this.handler = handler;
        this.errorHandler = errorHandler;
        this.filters = [
            (el, url) =>
                url &&
                url.indexOf(
                    `${document.location.protocol}//${document.location.host}`
                ) === 0,
            (el, url) => url !== document.location.href
        ];
    }

    addFilter(callback) {
        this.filters.push(callback);

        return this;
    }

    init() {
        delegate('click', 'a', (event, link) => {
            if (this.filters.every(filter => filter(link, link.href))) {
                this.go(link.href, link);
                event.preventDefault();
            }
        });

        delegate('submit', 'form', (event, form) => {
            const url = resolve(form.target);

            if (this.filters.every(filter => filter(form, url))) {
                this.submit(form, form);
                event.preventDefault();
            }
        });

        window.onpopstate = event => this.go(document.location.href);

        return this;
    }

    go(url, ...params) {
        url = resolve(url);

        if (!this.loaders[url]) {
            this.loaders[url] = new UrlLoader(url);
        }

        return this.load(this.loaders[url], ...params);
    }

    submit(form, ...params) {
        return this.load(new FormLoader(form), ...params);
    }

    load(loader, ...params) {
        const promise = loader.load();

        if (this.handler) {
            return promise
                .then(page => this.handler(page, ...params))
                .catch(err => {
                    if (this.errorHandler) {
                        this.errorHandler(err);
                    }

                    console.error(err);
                    this.loaders[url].go();
                });
        }

        return promise;
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
