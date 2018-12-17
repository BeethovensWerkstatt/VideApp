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

const hideDefs = {
  "mapDispatchToProps": true,
  "mapStateToProps": true,
  "render": true
}

// add export handler (symbolFound) to mark undocumented symbols
exports.handlers = {
  symbolFound: function(e) {
    if (typeof logtypes[e.astnode.type] === "undefined")
      console.log(e.astnode.type);
    var i = e.filename.indexOf('VideApp/source') + 'VideApp/source'.length;
    var filename = e.filename.substring(i);
    // if (e.astnode.id != null && e.astnode.id.name != null) console.log(e);
    if (logtypes[e.astnode.type] == true) {
      var codename = e.code.name;
      //console.log(e.astnode);
      if (e.comment === "@undocumented" && !hideDefs[e.code.name]) {
        e.comment = '/** undocumented <i>(' + filename + ':' + e.lineno + ')</i> */';
        if (typeof e.code.name === "string" && e.code.name.endsWith("render"))
          console.log(e);
      } else if (hideDefs[e.code.name]) {
        e.comment = "@undocumented";
      }
    }
    e.comment = e.comment.replace("$FILE", "'" + filename + "' (" + e.lineno + ")");
  }
};
