import Navigator from '../src/navigator.jsm';

const navigator = new Navigator(page => {
    console.log(page.state);

    page
        .replaceContent('.content')
        .changeTitle()
        .changeLocation();

    console.log(`Page changed to "${page.url}"`);
});

navigator.init();
