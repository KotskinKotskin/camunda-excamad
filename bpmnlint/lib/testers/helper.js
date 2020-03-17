const BpmnModdle = require('bpmn-moddle');

const readFileSync = require('fs').readFileSync;


/**
 * Create moddle instance.
 *
 * @param {String} xml the XML string
 *
 * @return {Promise<Object>}
 */
function createModdle(xml, elementType = 'bpmn:Definitions') {
  const moddle = new BpmnModdle();

  return new Promise((resolve, reject) => {
    moddle.fromXML(xml, elementType, { lax: true }, function(err, root, context) {
      if (err) {
        return reject(err);
      } else {
        return resolve({
          root,
          context,
          moddle
        });
      }
    });
  });
}

module.exports.createModdle = createModdle;


/**
 * Return moddle instance, read from the given file.
 *
 * @param {String} filePath
 *
 * @return {Promise<Object>}
 */
function readModdle(filePath) {
  const contents = readFileSync(filePath, 'utf8');

  return createModdle(contents);
}

module.exports.readModdle = readModdle;