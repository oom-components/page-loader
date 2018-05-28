/**
 * Class to handle a loaded page
 */
export default class Page {
    constructor(url, dom, state, event) {
        this.url = url;
        this.dom = dom;
        this.state = state || {};
        this.event = event;
    }

    get title() {
        return this.dom.title;
    }

    /**
     * Performs a querySelector in the page content or document
     *
     * @param  {string} selector
     * @param  {DocumentElement} context
     *
     * @return {Node}
     */
    querySelector(selector, context = this.dom) {
        const result = context.querySelector(selector);

        if (!result) {
            throw new Error(`Not found the target "${selector}"`);
        }

        return result;
    }

    /**
     * Performs a querySelector
     *
     * @param  {string} selector
     * @param  {DocumentElement} context
     *
     * @return {Nodelist}
     */
    querySelectorAll(selector, context = this.dom) {
        const result = context.querySelectorAll(selector);

        if (!result.length) {
            throw new Error(`Not found the target "${selector}"`);
        }

        return result;
    }

    /**
     * Replace an element in the document by an element in the page
     * Optionally, it can execute a callback to the new inserted element
     *
     * @param  {String} selector
     * @param  {Function|undefined} callback
     *
     * @return {this}
     */
    replaceContent(selector = 'body', callback = undefined) {
        const content = this.querySelector(selector);

        this.querySelector(selector, document).replaceWith(content);

        if (typeof callback === 'function') {
            callback(content);
        }

        return this;
    }

    /**
     * Appends the content of an element in the page in other element in the document
     * Optionally, it can execute a callback for each new inserted elements
     *
     * @param  {String} selector
     * @param  {Function|undefined} callback
     *
     * @return {this}
     */
    appendContent(target = 'body', callback = undefined) {
        const content = Array.from(this.querySelector(target).childNodes);
        const fragment = document.createDocumentFragment();

        content.forEach(item => fragment.appendChild(item));

        this.querySelector(target, document).append(fragment);

        if (typeof callback === 'function') {
            content
                .filter(item => item.nodeType === Node.ELEMENT_NODE)
                .forEach(callback);
        }

        return this;
    }

    /**
     * Change the title of the document with the title of the page
     *
     * @return {this}
     */
    changeTitle() {
        document.title = this.title;
        return this;
    }

    /**
     * Change the location of the document with the url of the page
     * Use the first argument to replace the state instead push
     *
     * @param  {Boolean} replace
     *
     * @return {this}
     */
    changeLocation(replace = false) {
        if (this.url === document.location.href) {
            return this;
        }

        if (replace) {
            history.replaceState(this.state, null, this.url);
        } else {
            history.pushState(this.state, null, this.url);
        }

        return this;
    }

    /**
     * Change the css of the current page
     *
     * @param {string} context
     *
     * @return {this}
     */
    changeStyles(context = 'head') {
        const documentContext = this.querySelector(context, document);
        const pageContext = this.querySelector(context);
        const oldLinks = Array.from(
            documentContext.querySelectorAll('link[rel="stylesheet"]')
        );
        const newLinks = Array.from(
            pageContext.querySelectorAll('link[rel="stylesheet"]')
        );

        oldLinks.forEach(link => {
            const exists = newLinks.find(newLink => newLink.href === link.href);

            if (!exists) {
                link.remove();
            }
        });

        newLinks.forEach(link => {
            const exists = oldLinks.find(oldLink => oldLink.href === link.href);

            if (!exists) {
                documentContext.append(link);
            }
        });

        return this;
    }

    /**
     * Change the scripts of the current page
     *
     * @param {string} context
     *
     * @return {this}
     */
    changeScripts(context = 'head') {
        const documentContext = this.querySelector(context, document);
        const pageContext = this.querySelector(context);
        const oldScripts = Array.from(
            documentContext.querySelectorAll('script[src]')
        );
        const newScripts = Array.from(
            pageContext.querySelectorAll('script[src]')
        );

        oldScripts.forEach(script => {
            const exists = newScripts.find(
                newScript => newScript.src === script.src
            );

            if (!exists) {
                script.remove();
            }
        });

        newScripts.forEach(script => {
            const exists = oldScripts.find(
                oldScript => oldScript.src === script.src
            );

            if (!exists) {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.defer = script.defer;
                newScript.async = script.async;

                documentContext.append(newScript);
            }
        });

        return this;
    }
}
