(function () {
    document.querySelectorAll('body > h1').forEach(h1 => h1.remove());

    const h1 = document.createElement('h1');
    h1.innerHTML = 'This is the third page with a module';

    document.querySelectorAll('.menu > a').forEach((link, index) => {
        if (index === 2) {
            link.classList.add('is-active');
        } else {
            link.classList.remove('is-active');
        }
    });

    document.body.prepend(h1);
})();