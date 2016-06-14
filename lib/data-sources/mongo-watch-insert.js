
//require("babel-polyfill")
var RX = require("rx");
var MongoOplog = require('mongo-oplog');



function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.key, args, "mongo-watch-insert");
}

module.exports = function(args, dataSources){
  var name = args.name;
  var connectString = args.connectionString;
  var nameSpace = args.nameSpace;

  var source = RX.Observable.create(function(observer){
    var oplog = MongoOplog(connectString, { ns: nameSpace }).tail();

    oplog.on("insert", function(doc){
      observer.onNext(doc);
    });
  })
  .publish()
  .refCount();

  vapor(args, dataSources);
  dataSources.set(args.name, source);
}

module.exports.vapor = vapor;

module.exports.getArguments = async function(prompt, dataSources){
  var name = await prompt("What name will you give this new instance?\n");
  var connectionString = await prompt("Input connection string for mongodb with path to local:\n");
  var nameSpace = await prompt("Input namespace this will be querying:\n");


  return {
    name:name,
    connectionString:connectionString,
    nameSpace: nameSpace
  }

}
