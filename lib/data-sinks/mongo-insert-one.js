
//require("babel-polyfill")
var RX = require("rx");
var MongoWrapper = require("../mongo-wrapper");

function vapor(args, dataSources){
  dataSources.get("creationMap").set(args.name, args.key, args, "mongo-insert-one");
}

module.exports = function(args, dataSources){
  var name = args.name;
  var connectString = args.connectionString;
  var collectionName = args.collectionName;
  var dataSource = dataSources.get(args.key);

  var subscription = dataSource.subscribe(function(data){
    if(data === null || data === undefined){
      subscription.dispose();
      return;
    }
    MongoWrapper.connectToMongo(connectString)
      .then(function(db){
        return MongoWrapper.insertOne(db, collectionName, data);
      });
  }, function(err){
    console.log(err);
  }, function(){
    dataSources.get("dataSinkInstances").remove(args.name);
  });

  vapor(args, dataSources);
  dataSources.get("dataSinkInstances").set(args.name, subscription);
}

module.exports.vapor = vapor;

module.exports.getArguments = async function(prompt, dataSources){
  var name = await prompt("What name will you give this new instance?\n");
  var fromSource = await prompt("What source will this be applied to?\n");
  var connectionString = await prompt("Input connection string for mongodb:\n");
  var collectionName = await prompt("Input collection this will be inserting:\n");

  return {
    name:name,
    key:fromSource,
    connectionString:connectionString,
    collectionName: collectionName
  };
}

module.exports.initialize = function(dataSources){
  dataSources.get("translations").set("mongo-insert-one", module.exports);
}
