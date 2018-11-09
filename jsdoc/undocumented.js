'use strict';

const logtypes = {
  "FunctionDeclaration": true,
  "VariableDeclarator": true,
  "ExportNamedDeclaration": false,
  "ClassExpression": true,
  "MethodDefinition": true
};

exports.handlers = {
  symbolFound: function(e) {
    // if (e.astnode.id != null && e.astnode.id.name != null) console.log(e);
    if (logtypes[e.astnode.type] == true && (e.comment === "@undocumented")) {
      e.comment = '/** undocumented */';
      // add to list
    }
  }
};
