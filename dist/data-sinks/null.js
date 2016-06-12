"use strict";

require("babel-polyfill");

var RX = require("rx");

function vapor(args, dataSources) {
  dataSources.get("creationMap").set(args.name, args.key, args, "null");
}

module.exports = function (args, dataSources) {
  var name = args.name;
  var key = args.key;

  var source = dataSources.get(key);
  var subscription = source.subscribe(function (data) {}, function (err) {
    console.log(err);
  }, function () {
    dataSources.get("dataSinkInstances").remove(args.name);
  });

  vapor(args, dataSources);
  dataSources.get("dataSinkInstances").set(args.name, subscription);
  return true;
};

module.exports.vapor = vapor;

module.exports.getArguments = function _callee(prompt, dataSources) {
  var name, subscriber;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return regeneratorRuntime.awrap(prompt("What name will the request generator take?\n"));

      case 2:
        name = _context.sent;
        _context.next = 5;
        return regeneratorRuntime.awrap(prompt("What data source will this subcribe to?\n"));

      case 5:
        subscriber = _context.sent;
        return _context.abrupt("return", {
          name: name,
          key: subscriber
        });

      case 7:
      case "end":
        return _context.stop();
    }
  }, null, this);
};