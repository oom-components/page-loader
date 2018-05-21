import Navigator from '../src/navigator.jsm';

const navigator = new Navigator(page => {
    page
        .replaceContent('.content')
        .changeTitle()
        .changeStyles()
        .changeScripts()
        .changeLocation();

    console.log(`Page changed to "${page.url}"`);
});

navigator.init();
