var translations = require("./dist/translations/index");

module.exports = function(dataSources){
  for(var i in translations){
    translations[i].initialize(dataSources);
  }
  dataSources.get("dataSinks").set("mongo-insert-one", require("./dist/data-sinks/mongo-insert-one"));
}
