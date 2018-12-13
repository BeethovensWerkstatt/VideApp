'use strict';

// what to document
const logtypes = {
  "ExportDefaultDeclaration": false,
  "ExportSpecifier": false,
  "ExportNamedDeclaration": false,
  "FunctionDeclaration": true,
  "FunctionExpression": true,
  "VariableDeclarator": true,
  "ClassDeclaration": true,
  "ClassExpression": false,
  "MethodDefinition": true,
  "AssignmentExpression": false,
  "ArrowFunctionExpression": false,
  "ObjectExpression": false,
  "Property": false
};

// add export handler (symbolFound) to mark undocumented symbols
exports.handlers = {
  symbolFound: function(e) {
    if (typeof logtypes[e.astnode.type] === "undefined")
      console.log(e.astnode.type);
    var i = e.filename.indexOf('VideApp/source') + 'VideApp/source'.length;
    var filename = e.filename.substring(i);
    // if (e.astnode.id != null && e.astnode.id.name != null) console.log(e);
    if (logtypes[e.astnode.type] == true && (e.comment === "@undocumented")) {
      e.comment = '/** undocumented <i>(' + filename + ':' + e.lineno + ')</i> */';
      // add to list
    }
    e.comment = e.comment.replace("$FILE", "'" + filename + "' (" + e.lineno + ")");
  }
};
