# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## UNRELEASED

### Changed

- Changed the signature of the navigator handler.
- Removed `page.state.event`.
- Renamed `page.state.cache` to `page.state.html`.
- Renamed extensions from `.jsm` to `.js` due `Content-Type` header issues
- The `package.json` is now more browser-friendly using `browser` and `files` keys

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


[1.0.0]: https://github.com/oom-components/page-loader/compare/v0.2.4...v1.0.0
[0.2.4]: https://github.com/oom-components/page-loader/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/oom-components/page-loader/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/oom-components/page-loader/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/oom-components/page-loader/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/oom-components/page-loader/compare/v0.1.0...v0.2.0
