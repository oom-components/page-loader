import UrlLoader from './url-loader.jsm';

export default class Navigator {
    constructor(handler, errorHandler) {
        this.loaders = {};
        this.handler = handler;
        this.errorHandler = errorHandler;
    }

    set(loader) {
        this.loaders[loader.url] = loader;

        return this;
    }

    get(url) {
        return this.loaders[url];
    }

    getOrCreate(url) {
        if (!this.loaders[url]) {
            this.set(new UrlLoader(url));
        }

        return this.loaders[url];
    }

    go(url, ...params) {
        if (!this.loaders[url]) {
            this.set(new UrlLoader(url));
        }

        const promise = this.loaders[url].load();

        if (this.handler) {
            return promise
                .then(page => this.handler(page, ...params))
                .catch(err => {
                    if (this.errorHandler) {
                        this.errorHandler(err);
                    }

                    this.loaders[url].go();
                });
        }

        return promise;
    }
}
