import Navigator from '../src/navigator.jsm';

const navigator = new Navigator(
    page => {
        page
            .replaceContent('.content')
            .applyTitle()
            .applyLocation();

        console.log(`Page changed to "${page.url}"`);
    },
    err => console.error(err)
);

window.onpopstate = event => navigator.go(document.location.href);

document.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', e => {
        e.preventDefault();
        navigator.go(a.href);
    })
);
