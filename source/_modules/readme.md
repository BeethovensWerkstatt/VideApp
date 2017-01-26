# Modules Folder

All files in this folder should be moved into separate node modules. However, those files
use native ES6 modules (import / export statements) instead of the CommonJS approach
used by NodeJS so far (module.exports= {} / require('…')). 


**Interesting links related to the problem:** 

* https://hackernoon.com/node-js-tc-39-and-modules-a1118aecf95e
* https://github.com/nodejs/help/issues/53
* https://github.com/nodejs/node/wiki/ES6-Module-Detection-in-Node
* http://researchhubs.com/post/computing/javascript/nodejs-require-vs-es6-import-export.html

For the time being, all files are written as plain standard ES6 modules, relying on Babel
to resolve everything properly. 