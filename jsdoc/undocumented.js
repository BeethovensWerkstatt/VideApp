'use strict';

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

exports.handlers = {
  symbolFound: function(e) {
    if (typeof logtypes[e.astnode.type] === "undefined")
      console.log(e.astnode.type);
    // if (e.astnode.id != null && e.astnode.id.name != null) console.log(e);
    if (logtypes[e.astnode.type] == true && (e.comment === "@undocumented")) {
      e.comment = '/** undocumented */';
      // add to list
    }
  }
};
