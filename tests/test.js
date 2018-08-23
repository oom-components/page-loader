import Navitator from '../src/navigator.js';
import { UrlLoader } from '../src/loaders.js';

const expect = chai.expect;

mocha.setup('bdd');

describe('Page loader testing', function() {
    context('Links', function() {
        it('has correct initial styles', function() {
            const main = document.querySelector('main');
            const mainStyles = getComputedStyle(main);
            const pStyles = getComputedStyle(main.firstElementChild);

            expect(mainStyles.backgroundColor).to.equal('rgb(255, 255, 0)');
            expect(pStyles.color).to.equal('rgb(0, 0, 255)');
            expect(main.firstElementChild.innerText).to.equal('Page 0');
        });

        it('load the new page', function (done) {
            const loader = new UrlLoader('page1.html');

            loader.load()
                .then(page => {
                    expect(document.location.pathname).to.equal('/tests/page1.html');
                    expect(document.title).to.equal('Page 1');

                    page.replaceStyles()
                        .replaceContent('main')
                        .promise.then(() => {
                            const main = document.querySelector('main');
                            const mainStyles = getComputedStyle(main);
                            const pStyles = getComputedStyle(main.firstElementChild);

                            expect(mainStyles.backgroundColor).to.equal('rgba(0, 0, 0, 0)');
                            expect(pStyles.color).to.equal('rgb(255, 0, 0)');
                            expect(main.firstElementChild.innerText).to.equal('Page 1');
                            done();
                        });
                })
        });


        it('go to previous page', function (done) {
            const loader = new UrlLoader('index.html');

            loader.load()
                .then(page => {
                    expect(document.location.pathname).to.equal('/tests/index.html');
                    expect(document.title).to.equal('Page loader tests');

                    page.replaceStyles()
                        .replaceContent('main')
                        .promise.then(() => {
                            const main = document.querySelector('main');
                            const mainStyles = getComputedStyle(main);
                            const pStyles = getComputedStyle(main.firstElementChild);

                            expect(mainStyles.backgroundColor).to.equal('rgb(255, 255, 0)');
                            expect(pStyles.color).to.equal('rgb(0, 0, 255)');
                            expect(main.firstElementChild.innerText).to.equal('Page 0');
                            done();
                        });
                })
        })
    });
});

mocha.run();
