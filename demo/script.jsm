import Navigator from '../src/navigator.jsm';

const navigator = new Navigator(
    page => {
        init(page.querySelector('main'));

        page
            .replaceContent('main')
            .applyTitle()
            .applyLocation();

        console.log(`Page changed to "${page.url}"`);
    },
    err => console.log(err)
);

window.onpopstate = event => navigator.go(document.location.href);

function init(context) {
    context.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            navigator.go(a.href);
        });
    });
}

init(document);
