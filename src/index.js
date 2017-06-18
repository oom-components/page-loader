import d from 'd_js';
import polyfill from 'intersection-observer';

export default class PageLoader {
    constructor(resultSelector, buttonSelector) {
        this.resultSelector = resultSelector;
        this.result = d.get(resultSelector);
        this.buttonSelector = buttonSelector;
        this.button = d.get(buttonSelector);

        this.pages = [
            {
                title: document.title,
                url: document.location.href,
                target: null
            }
        ];

        d.on('click', this.button, event => {
            event.preventDefault();
            this.loadPage(this.button.getAttribute('href'));
        });

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
                } else {
                    console.log(entry);
                }
            });
        });
    }

    loadPage(url) {
        fetch(url).then(response => response.text()).then(html => {
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

            d
                .getAll(result.children)
                .forEach(child => this.result.appendChild(child));

            this.pages.push(page);
            this.observer.observe(page.target);
            this.changePage(page);

            if (button) {
                this.button.parentNode.replaceChild(button, this.button);

                d.on('click', button, event => {
                    event.preventDefault();
                    this.loadPage(this.button.getAttribute('href'));
                });
            } else {
                this.button.parentNode.removeChild(this.button);
            }

            this.button = button;
        });
    }

    changePage(page) {
        history.replaceState({}, page.title, page.url);
        document.title = page.title;
    }
}

function isNextPage(entry) {
    return entry.isIntersecting && entry.boundingClientRect.top > 0;
}

function isPreviousPage(entry) {
    return !entry.isIntersecting && entry.boundingClientRect.top > 0;
}
