import PageLoader from '../src';

const loader = new PageLoader('.elements', '.pagination a');

loader.on('beforeLoadPage', url => {
    console.log('Preparing to load page:', url);
});

loader.on('loadPage', page => {
    console.log('New page:', page);
});

loader.on('changePage', page => {
    console.log('Current page changed to:', page);
});

loader.on('showButton', (button, entry) => {
    console.log(entry);
    loader.loadPage(button.href);
});
