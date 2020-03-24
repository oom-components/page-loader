# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [4.0.1] - Unreleased
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

[4.0.1]: https://github.com/oom-components/page-loader/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/oom-components/page-loader/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/oom-components/page-loader/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/oom-components/page-loader/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/oom-components/page-loader/compare/v0.2.4...v1.0.0
[0.2.4]: https://github.com/oom-components/page-loader/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/oom-components/page-loader/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/oom-components/page-loader/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/oom-components/page-loader/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/oom-components/page-loader/compare/v0.1.0...v0.2.0
