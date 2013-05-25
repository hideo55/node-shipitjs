//
// Simple Template Module (à la Mustache templates)
//

module.exports = tmpl;

var regexp = /{{\s*([a-zA-Z]+)\s*}}/g;

function tmpl(str, ctx) {
  if ('string' !== typeof str) {
    throw new Error('str MUST be a string');
  }

  if (null == ctx) {
    return str;
  }

  return str.replace(regexp, function (match, id) {
    return null == ctx[id] ? '' : ctx[id];
  });
}
