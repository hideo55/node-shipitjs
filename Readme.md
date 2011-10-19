
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
      -x,--exec      Run command actually(default dry-run mode)

Create configuration file.

    $ cd /path/to/module
    $ shipitjs write-config

Execute release command with Dry-Run mode.

    $ shipitjs release patch
    
Execute release command actually.

    $ shipitjs -x release patch

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