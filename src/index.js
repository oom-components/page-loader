import d from 'd_js';
import polyfill from 'intersection-observer';

export default class PageLoader {
    constructor(resultSelector, buttonSelector, context = document) {
        this.events = {};

        this.resultSelector = resultSelector;
        this.result = context.querySelector(resultSelector);

        this.buttonSelector = buttonSelector;
        this.button = context.querySelector(buttonSelector);

        this.currentPage = {
            title: document.title,
            url: document.location.href,
            target: null
        };

        this.pages = [this.currentPage];

        if (this.button) {
            d.on('click', this.button, onClick.bind(this));
        }

        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                let page = this.pages.find(
                    page => page.target === entry.target
                );

                if (page) {
                    if (isNextPage(entry)) {
                        this.changePage(page);
                    } else if (isPreviousPage(entry)) {
                        this.changePage(page.previous);
                    }
                }
            });
        });
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }

        this.events[event].push(callback);
    }

    off(event, callback) {
        if (this.events[event]) {
            if (!callback) {
                delete this.events[event];
            } else {
                const index = this.events[event].indexOf(callback);

                if (index !== -1) {
                    this.events[event].splice(index, 1);
                }
            }
        }
    }

    trigger(event, args = []) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback.apply(this, args));
        }
    }

    loadPage(url) {
        this.trigger('beforeLoadPage', [url]);

        return fetch(url).then(response => response.text()).then(html => {
            const doc = document.implementation.createHTMLDocument();
            doc.documentElement.innerHTML = html;

            const result = doc.documentElement.querySelector(
                this.resultSelector
            );
            const button = doc.documentElement.querySelector(
                this.buttonSelector
            );
            const page = {
                title: doc.title,
                url: url,
                target: result.firstElementChild,
                previous: this.pages[this.pages.length - 1]
            };

            //if the button is the last element of the result
            const last = this.result.lastElementChild;
            if (last === this.button || last.contains(this.button)) {
                toArray(result.children)
                    .filter(
                        child => child !== button && !child.contains(button)
                    )
                    .forEach(child => last.before(child));
            } else {
                toArray(result.children).forEach(child =>
                    this.result.append(child)
                );
            }

            this.pages.push(page);
            this.observer.observe(page.target);
            this.trigger('loadPage', [page]);
            this.changePage(page, true);

            if (button) {
                this.button.replaceWith(button);

                d.on('click', button, onClick.bind(this));
            } else {
                this.button.remove();
            }

            this.button = button;
        });
    }

    changePage(page, isNew = false) {
        if (page !== this.currentPage) {
            if (isNew) {
                history.pushState({}, page.title, page.url);
            } else {
                history.replaceState({}, page.title, page.url);
            }

            document.title = page.title;
            this.currentPage = page;
            this.trigger('changePage', [page]);
        }
    }
}

function onClick(event) {
    const url = this.button.getAttribute('href');

    if (!url) {
        return;
    }

    event.preventDefault();

    this.loadPage(url).catch(err => {
        console.error(err);
        document.location = url;
    });
}

function isNextPage(entry) {
    return entry.isIntersecting && entry.boundingClientRect.top > 0;
}

function isPreviousPage(entry) {
    return !entry.isIntersecting && entry.boundingClientRect.top > 0;
}

function toArray(el) {
    return Array.prototype.slice.call(el);
}
