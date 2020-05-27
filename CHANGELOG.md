# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [4.5.1] - 2020-05-27
### Fixed
- `load` event

## [4.5.0] - 2020-05-14
### Added
- Ignored elements that have the `data-loader="off"` attribute (or are children of any element with them)
- Allow to set a handler for downloads
- Passed the target and submitter elements to the loader handler

### Fixed
- But with infinite downloads

## [4.4.0] - 2020-05-12
### Added
- New function `.on()` to add callback for the following events:
  - beforeFilter: Any click or submit in the document, before filter
  - beforeLoad: Filtered clicks or submits before load
  - load: After the new page is loaded
  - error: After an error
- The filter functions have a third argument with the emitter (only for forms)
- New module to handle downloads (links with `download` attribute)
- New argument to set a `submitter` to `Navigator.submit()` function

## [4.3.0] - 2020-04-18
### Added
- New `page.resetScroll()` function to move the scroll to top

### Fixed
- Fallback action of `FormLoader`
- All responses of `FormLoader` are valid (even those returning error responses like `4xx`). This prevent double submits.
- The loader classes (`UrlLoader` and `FormLoader`) are easier to extend due some logic are moved to the new `validateResponse()` and `responseIsCacheable()` functions.
- Support for anchor navigations.

## [4.2.3] - 2020-04-14
### Fixed
- Bug detecting `formaction` and `formmethod` attributes

## [4.2.2] - 2020-04-13
### Fixed
- Bug in `FormLoader` accessing to `this` before calling `super()`

## [4.2.1] - 2020-04-06
### Fixed
- Ignore anchors with `download` attribute
- Do not cache responses with `no-cache` value in `Cache-Control` header

## [4.2.0] - 2020-03-31
### Added
- Support for buttons with `formAction` attribute
- Support for buttons with `formMethod` attribute

### Fixed
- Ignore submit forms after click on buttons with `formTarget` attribute
- Append the value of the submitter button on send a form

## [4.1.2] - 2020-03-31
### Fixed
- Ignore click events combined with `ctrl`, `meta`, `shift` and `alt` keys.
- Do not ignore submit events if the url is the same than the current location.

## [4.1.1] - 2020-03-25
### Fixed
- FormLoader `options` argument

## [4.1.0] - 2020-03-25
### Added
- `navigator.go()` and `navigator.submit()` have a third argument to send options to fetch.

### Fixed
- Get the right url for redirected responses
- Catch promise errors

## [4.0.0] - 2020-01-26
### Changed
- The loader does not run a pushState anymore. Use `page.updateState()`
- For simplicity, the handler receives a function to load the page, instead the loader object.

## [3.0.0] - 2018-09-17
### Changed
- `ReplaceScripts` and `ReplaceStyles` returns a promise resolved when the scripts and styles are loaded

## [2.0.0] - 2018-09-04
### Added
- New function `page.removeContent()`

### Changed
- Changed the signature of the navigator handler.
- Removed `page.state.event`.
- Renamed `page.state.cache` to `page.state.html`.
- Renamed extensions from `.jsm` to `.js` due `Content-Type` header issues.
- Renamed function `loader.go` to `loader.fallback()`.
- Throwed exceptions on `3xx` responses.
- The `package.json` is now more browser-friendly using `browser` and `files` keys.
- `page.changeStyles()` changes also the `<style>` elements.
- Renamed `page.changeStyles()` to `page.replaceStyles()`.
- Renamed `page.changeScripts()` to `page.replaceScripts()`.
- Merged `url-loader.js` and `form-loader.js` to a single file `loaders.js`.

### Removed
- Removed the `navigator.currentLoader`, `navigator.nextLoader` and `page.state.direction` properties.
- Removed the ability to force a `history.back()`. It can be implemented in the navigator handler.

## [1.0.0] - 2018-05-21
### Changed
- Rename package to `@oom/page-loader`
- Changed the file extension to `jsm` for compatibility with native es6 modules
- Refactored the whole library making it dependency-free, more flexible and universal. Now it's not intended only for pagination, but for any dinamic page loading, forms, etc.

## [0.2.4] - 2017-08-05
### Changed
- Improved the history on load new pages. Use `pushState` on load new pages and `replaceState` on change to a previous page.
- Upgraded `d_js` to 2.0.
- Upgraded `intersection-observer` to 0.4.0.

## [0.2.3] - 2017-06-20
### Fixed
- The bug fixed in 0.2.0 was not really fixed.

## [0.2.2] - 2017-06-20
### Fixed
- Bug inserting data when the button is inside the result.

## [0.2.1] - 2017-06-20
### Added
- Allow to put the button inside the result, as the last element.

## [0.2.0] - 2017-06-19
### Added
- New constructor argument to customize the selector context
- Support for events: `beforeLoadPage`, `loadPage` and `changePage`.

## 0.1.0 - 2017-06-18
First version with basic features

[4.5.1]: https://github.com/oom-components/page-loader/compare/v4.5.0...v4.5.1
[4.5.0]: https://github.com/oom-components/page-loader/compare/v4.4.0...v4.5.0
[4.4.0]: https://github.com/oom-components/page-loader/compare/v4.3.0...v4.4.0
[4.3.0]: https://github.com/oom-components/page-loader/compare/v4.2.3...v4.3.0
[4.2.3]: https://github.com/oom-components/page-loader/compare/v4.2.2...v4.2.3
[4.2.2]: https://github.com/oom-components/page-loader/compare/v4.2.1...v4.2.2
[4.2.1]: https://github.com/oom-components/page-loader/compare/v4.2.0...v4.2.1
[4.2.0]: https://github.com/oom-components/page-loader/compare/v4.1.2...v4.2.0
[4.1.2]: https://github.com/oom-components/page-loader/compare/v4.1.1...v4.1.2
[4.1.1]: https://github.com/oom-components/page-loader/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/oom-components/page-loader/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/oom-components/page-loader/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/oom-components/page-loader/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/oom-components/page-loader/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/oom-components/page-loader/compare/v0.2.4...v1.0.0
[0.2.4]: https://github.com/oom-components/page-loader/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/oom-components/page-loader/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/oom-components/page-loader/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/oom-components/page-loader/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/oom-components/page-loader/compare/v0.1.0...v0.2.0
