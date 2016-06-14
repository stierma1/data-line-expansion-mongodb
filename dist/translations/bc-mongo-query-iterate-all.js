
//require("babel-polyfill")
var RX = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources) {
  dataSources.get("creationMap").set(args.name, args.key, args, "bc-mongo-query-iterate-all");
}

module.exports = function (args, dataSources) {
  var name = args.name;
  var query = args.query;
  var projection = args.projection;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;

  var dataSource = dataSources.get(args.key);

  var source = dataSource.map(function () {
    var prom = MongoWrapper.connectToMongo(connectString).then(function (db) {
      return MongoWrapper.findAll(db, collectionName, query, projection);
    });
    return prom;
  }).concatAll().flatMap(function (val) {
    return val;
  }).publish().refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
};

module.exports.vapor = vapor;

module.exports.getArguments = function _callee(prompt, dataSources) {
  var name, fromSource, connectionString, collectionName, query, projection;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return regeneratorRuntime.awrap(prompt("What name will you give this new instance?\n"));

      case 2:
        name = _context.sent;
        _context.next = 5;
        return regeneratorRuntime.awrap(prompt("What source will this be applied to?\n"));

      case 5:
        fromSource = _context.sent;
        _context.next = 8;
        return regeneratorRuntime.awrap(prompt("Input connection string for mongodb:\n"));

      case 8:
        connectionString = _context.sent;
        _context.next = 11;
        return regeneratorRuntime.awrap(prompt("Input collection this will be querying:\n"));

      case 11:
        collectionName = _context.sent;
        _context.prev = 12;
        _context.t0 = JSON;
        _context.next = 16;
        return regeneratorRuntime.awrap(prompt("Input query: (expects Json, no input will find all docs in collection)\n"));

      case 16:
        _context.t1 = _context.sent;
        query = _context.t0.parse.call(_context.t0, _context.t1);
        _context.next = 23;
        break;

      case 20:
        _context.prev = 20;
        _context.t2 = _context["catch"](12);

        query = undefined;

      case 23:
        _context.prev = 23;
        _context.t3 = JSON;
        _context.next = 27;
        return regeneratorRuntime.awrap(prompt("Input projection: (expects Json, no input will not filter any docs in collection)\n"));

      case 27:
        _context.t4 = _context.sent;
        projection = _context.t3.parse.call(_context.t3, _context.t4);
        _context.next = 34;
        break;

      case 31:
        _context.prev = 31;
        _context.t5 = _context["catch"](23);

        projection = undefined;

      case 34:
        return _context.abrupt("return", {
          name: name,
          key: fromSource,
          connectionString: connectionString,
          collectionName: collectionName,
          query: query,
          projection: projection
        });

      case 35:
      case "end":
        return _context.stop();
    }
  }, null, this, [[12, 20], [23, 31]]);
};

module.exports.initialize = function (dataSources) {
  dataSources.get("translations").set("bc-mongo-query-iterate-all", module.exports);
};