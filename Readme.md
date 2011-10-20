
# ShipIt.js

  NPM package release management tool

# Usage

    Usage: shipitjs [options] [command]
    
    Commands:
    
      write-config 
      Write default configuration file to ./.shipit.json
      
      release [release-type]
      Release the package to NPM. release-type is [major|minor|patch|build|custom].
    
    Options:
    
      -h, --help     output usage information
      -v, --version  output the version number
      -x,--exec      Run command actually(default Dry-Run mode)

Create configuration file.

    $ cd /path/to/module
    $ shipitjs write-config

Execute release command with Dry-Run mode.

    $ shipitjs release patch
    
Execute release command actually.

    $ shipitjs -x release patch

## Configuration

ShipItJS can configuration by .shipit.json file.

Default configuration file can created by `shipitjs write-config` command.

Default configuration is like below

    {
      "Steps": ["FindVersion", "ChangeVersion", "CheckChangeLog", "Commit", "Tag", "Publish"],
    	"CheckChangeLog": {
    		"files": ["History.md"]
    	}
    }

## Steps

### FindVersion

Find current version form package.json and VCS tag.

### ChangeVersion

Change version number in package.json

### CheckChangeLog

Check ChangeLog file 

#### Option

* files

Please specify the filename of ChangeLog in an array.

    {
      "Steps": ["FindVersion", "ChangeVersion", "CheckChangeLog", "Commit", "Tag", "Publish"],
    	"CheckChangeLog": {
    		"files": ["History.md"]
    	}
    }

### Commit

Commit to VCS

### Tag

Tagging the version number to VCS.

### Publish

Publish module to NPM registry.

## VC (Version Control)

ShipItJS currently support only Git.

### Git

#### Option

VC's git support can configuration like below

    {
      "Git": {
        "TagPattern": "version-%v",
        "SignTag": true,
        "PushTo": "origin master"
      }
    }

* PushTo

If you want the new version to be pushed elsewhare, then you can specify the destination in this. 

* TagPattern

If you want tag to be follow specify pattern, then you can specify tag pattern.'%v' is replaced by version string.

* SignTag

Should be set ot truely if you wish tags to be GPG/PGP signed.

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