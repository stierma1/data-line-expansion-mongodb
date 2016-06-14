
//require("babel-polyfill")
var RX = require("rx");
var MongoOplog = require('mongo-oplog');

function vapor(args, dataSources) {
  dataSources.get("creationMap").set(args.name, args.key, args, "mongo-watch-insert");
}

module.exports = function (args, dataSources) {
  var name = args.name;
  var connectString = args.connectionString;
  var nameSpace = args.nameSpace;

  var source = RX.Observable.create(function (observer) {
    var oplog = MongoOplog(connectString, { ns: nameSpace }).tail();

    oplog.on("insert", function (doc) {
      observer.onNext(doc);
    });
  }).publish().refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
};

module.exports.vapor = vapor;

module.exports.getArguments = function _callee(prompt, dataSources) {
  var name, connectionString, nameSpace;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return regeneratorRuntime.awrap(prompt("What name will you give this new instance?\n"));

      case 2:
        name = _context.sent;
        _context.next = 5;
        return regeneratorRuntime.awrap(prompt("Input connection string for mongodb with path to local:\n"));

      case 5:
        connectionString = _context.sent;
        _context.next = 8;
        return regeneratorRuntime.awrap(prompt("Input namespace this will be querying:\n"));

      case 8:
        nameSpace = _context.sent;
        return _context.abrupt("return", {
          name: name,
          connectionString: connectionString,
          nameSpace: nameSpace
        });

      case 10:
      case "end":
        return _context.stop();
    }
  }, null, this);
};