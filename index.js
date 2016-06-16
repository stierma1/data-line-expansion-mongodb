var translations = require("./dist/translations/index");

module.exports = function(dataSources){
  for(var i in translations){
    translations[i].initialize(dataSources);
  }
  dataSources.get("dataSinks").set("mongo-insert-one", require("./dist/data-sinks/mongo-insert-one"));
  dataSources.get("dataSourceTypes").set("mongo-query-iterate", require("./dist/data-sources/mongo-query-iterate"));
  dataSources.get("dataSourceTypes").set("mongo-query-iterate-destroy", require("./dist/data-sources/mongo-query-iterate-destroy"));
  dataSources.get("dataSourceTypes").set("mongo-watch-insert", require("./dist/data-sources/mongo-watch-insert"));
  dataSources.get("dataSourceTypes").set("mongo-tail-collection", require("./dist/data-sources/mongo-tail-collection"));
}
