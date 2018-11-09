'use strict';

exports.handlers = {
  symbolFound: function(e) {
    if (e.astnode.id != null && e.astnode.id.name != null && e.astnode.id.name.length > 3) console.log(e);
    if ((e.comment === "@undocumented")) {
      e.comment = '/** undocumented */';
    }
  }
};
