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
                this.go(link.href, Object.assign({}, link.dataset));
                event.preventDefault();
            }
        });

        delegate('submit', 'form', (event, form) => {
            const url = resolve(form.target);

            if (this.filters.every(filter => filter(form, url))) {
                this.submit(form, Object.assign({}, form.dataset));
                event.preventDefault();
            }
        });

        window.onpopstate = event =>
            this.go(document.location.href, event.state);

        return this;
    }

    go(url, state = {}) {
        url = resolve(url);

        if (!this.loaders[url]) {
            this.loaders[url] = new UrlLoader(url);
        }

        return this.load(this.loaders[url], state);
    }

    submit(form, state = {}) {
        return this.load(new FormLoader(form), state);
    }

    load(loader, state = {}) {
        const promise = loader.load(state);

        if (this.handler) {
            return promise.then(page => this.handler(page)).catch(err => {
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
