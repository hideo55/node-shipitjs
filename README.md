# ShipIt.js

A release management tool for NPM packages.

## Installation

Install latest version directly from NPM repository:

    npm install -g shipitjs

or, clone and install from local copy (if you plan on hacking on it):

    git clone git://github.com/hideo55/shipitjs.git
    npm install -g ./shipitjs

## Usage

    Usage: shipitjs [options] [command]

    Commands:

      init                   Write default configuration to `./.shipit.json`.
      release [release-type] Release the package to NPM, where `release-type`
                             is [major|minor|patch|build|custom].

    Options:

      -h, --help     output usage information
      -V, --version  output the version number
      -x, --exec     Actually run commands (defaults to dry-run)

The `release` command is, by default, run in *dry-run* mode; so, it is easy and
safe to confirm what will happen.  You must specify the `-x` (or `--exec`)
option explicitly in order to actually execute the steps.

## Semantic Versioning

[Semantic Versioning][semver] is used for version numbers.  See the [the
spec][semver] for more detailed information.

Basically, version numbers follow these formats:

 *  `major "." minor "." patch`
 *  `major "." minor "." patch "-" build`

For example, `0.0.1` and `0.0.1-1` are valid version numbers; however, `x0r3` is
not.

If, say, the current version number is `0.0.1`, then the next version numbers
would be:

 *  `1.0.0` for a *major* version bump
 *  `0.1.0` for a *minor* version bump
 *  `0.0.2` for a *patch* version bump
 *  `0.0.1-1` for a *build* version bump

[semver]: http://semver.org/

## Configuration

The config file is named `.shipit.json`.  A default config file can be generated
with the `init` command:

    $ cd /path/to/module
    $ shipitjs init

An example config file:

```json
{
  "steps": ["FindVersion", "ChangeVersion", "CheckChangeLog", "Commit", "Tag", "Publish"],
  "CheckChangeLog": {
    "files": ["History.md"]
  }
}
```

## Steps

### FindVersion

Attempts to infer the current version number from VCS tag.  If that fails, then
the version number in `package.json` (or `package.ls`) is used.  The next
version number is then calculated (according to Semantic Versioning) and the
user is prompted for confirmation.

#### Config

None.

### ChangeVersion

Changes the version number specified in `package.json` (or `package.ls`).  It
attempts also to update `exports.version` if a *main* script has been defined.

#### Config

##### file (String)

If you manage your `package.json` with LiveScript, then specify `package.ls`.
`npm run prepublish` will be executed for you automatically.

**NOTE:** You must also specify a truthy value for the global `usePackageLS`.

```json
{
  "usePackageLS": true,
  "ChangeVersion": {
    "file": "package.ls"
  }
}
```

### CheckChangeLog

Checks changelog(s) for entries for the new version number.  Provides option to
edit changelog (using the current user's `$EDITOR`, defaults to `vim`) if no
entry was found.

#### Config

##### files (Array)

An array of changelog filenames to check.

```json
{
  "CheckChangeLog": {
    "files": ["History.md"]
  }
}
```

### Commit

Puts together a commit message with diffs for all changelogs, then commits all
local changes.

#### Config

None.

### Tag

Makes a tag in the VCS with the new version number.

#### Config

None.

### Publish

Publishes module to the NPM registry, asking first for user confirmation.

#### Config

None.

## Version Control Systems

Currently Git and Mercurial are the only VCS supported.

### Git

An example git configuration:

```json
{
  "vc": {
    "Git": {
      "PushTo": "origin",
      "SignTag": true,
      "TagPattern": "version-%v"
    }
  }
}
```

#### PushTo (String)

Where the new version should be pushed.

#### SignTag (Boolean)

Whether tags should be GPG/PGP signed.

#### TagPattern (String)

Custom pattern for tag names (`%v` is replaced by version number).


### Mercurial

An example mercurial configuration:

```json
{
  "vc": {
    "Hg": {
      "PushTo": "remote"
    }
  }
}
```

#### PushTo (String)

Where the new version should be pushed.

## License

(The MIT License)

Copyright (c) 2011 Hideaki Ohno &lt;hide.o.j55{at}gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
