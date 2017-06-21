# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) 
and this project adheres to [Semantic Versioning](http://semver.org/).

## UNRELEASED

### Changed

* Improved the history on load new pages. Use `pushState` on load new pages and `replaceState` on change to a previous page.

## 0.2.3 - 2017-06-20

### Fixed

* The bug fixed in 0.2.0 was not really fixed.

## 0.2.2 - 2017-06-20

### Fixed

* Bug inserting data when the button is inside the result.

## 0.2.1 - 2017-06-20

### Added

* Allow to put the button inside the result, as the last element.

## 0.2.0 - 2017-06-19

### Added

* New constructor argument to customize the selector context
* Support for events: `beforeLoadPage`, `loadPage` and `changePage`.

## 0.1.0 - 2017-06-18

First version with basic features
