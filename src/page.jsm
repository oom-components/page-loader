export default class Page {
    static createFromHtml(html, url) {
        html = html.trim().replace(/^\<!DOCTYPE html\>/i, '');
        const doc = document.implementation.createHTMLDocument();
        doc.documentElement.innerHTML = html;

        return new Page(url, doc);
    }

    constructor(url, dom) {
        this.url = url;
        this.dom = dom;
    }

    get title() {
        return this.dom.title;
    }

    querySelector(selector, context = this.dom) {
        const result = context.querySelector(selector);

        if (!result) {
            throw new Error(`Not found the target "${selector}"`);
        }

        return result;
    }

    querySelectorAll(selector, context = this.dom) {
        const result = context.querySelectorAll(selector);

        if (!result.length) {
            throw new Error(`Not found the target "${selector}"`);
        }

        return result;
    }

    replaceContent(target = 'body', callback = undefined) {
        const content = this.querySelector(target);

        this.querySelector(target, document).replaceWith(content);

        if (typeof callback === 'function') {
            callback(content);
        }

        return this;
    }

    applyTitle() {
        document.title = this.title;
        return this;
    }

    applyLocation(replace = false) {
        if (this.url === document.location.href) {
            return this;
        }

        if (replace) {
            history.replaceState({}, null, this.url);
        } else {
            history.pushState({}, null, this.url);
        }

        return this;
    }
}
