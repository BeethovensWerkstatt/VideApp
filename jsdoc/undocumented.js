'use strict';

// what to document
const logtypes = {
  "ExportDefaultDeclaration": false,
  "ExportSpecifier": false,
  "ExportNamedDeclaration": false,
  "FunctionDeclaration": true,
  "FunctionExpression": true,
  "VariableDeclarator": false,
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
  "render": true,
  "componentDidMount": true,
  "componentDidUpdate": true,
  "componentWillReceiveProps": true,
  "shouldComponentUpdate": true
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
      if (typeof codename === "string") {
        var h = codename.indexOf("#");
        if (h > 0)
          codename = codename.substring(h + 1);
      }
      if (e.comment === "@undocumented" && !hideDefs[codename]) {
        e.comment = '/** undocumented <i>(' + filename + ':' + e.lineno + ')</i> */';
      } else if (hideDefs[codename]) {
        e.comment = "@undocumented";
      }
    }
    e.comment = e.comment.replace("$FILE", "'" + filename + "' (" + e.lineno + ")");
  }
};
