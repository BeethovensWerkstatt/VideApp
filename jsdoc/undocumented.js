'use strict';

// what to document
const logtypes = {
  "ExportDefaultDeclaration": true,
  "ExportSpecifier": false,
  "ExportNamedDeclaration": true,
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
    // if (e.astnode.id != null && e.astnode.id.name != null) console.log(e);
    if (logtypes[e.astnode.type] == true && (e.comment === "@undocumented")) {
      var i = e.filename.indexOf('VideApp/source') + 'VideApp/source'.length;
      e.comment = '/** undocumented <i>(' + e.filename.substring(i) + ':' + e.lineno +')</i> */';
      // add to list
    }
  }
};
