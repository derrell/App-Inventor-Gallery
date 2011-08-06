/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.AppsTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    "test: App addition and deletion" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      // Adding then deleting an App to see it go smoothly.
      var myAppData = dbifSim.addOrEditApp(null, {owner: "hi"});
      var myAppInfo;
      this.assertInstance(myAppData, Object, "correctly adding app");
      this.assertInteger(myAppData.uid, "new app uid");
      this.assert(dbifSim.deleteApp(myAppData.uid), "removing app");
    },
    
    "test: MApps.getAppListAll()" : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      var appList = dbifSim.getAppListAll(false);
      
      this.assertInteger(appList.apps[0].uid, "retrieving list of all apps");
    },
    
    "test: MApps._requestedFields()" : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      var myApp =
      {
        field1 : "Hello,",
        field2 : "I'm",
        field3 : "unimportant",
        field4 : "data."        
      };
      
      var requestedFields = 
      {
        field1 : "field1",
        field3 : "fieldInfinity"       
      };
      
      var requestedFieldsCopy = 
      {
        field1 : "field1",
        field3 : "fieldInfinity"       
      };
      
      var expectedResult = 
      {
        field1 : "Hello,",
        fieldInfinity : "unimportant"
      };
      
      aiagallery.dbif.MApps._requestedFields(myApp, requestedFields);
      
      this.assertJsonEquals(requestedFields, requestedFieldsCopy, 
                            "requestedFields parameter unmutated");
      this.assertJsonEquals(myApp, expectedResult, "requested fields");
    },
    
    "test: MApps.getAppInfo()" : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      dbifSim.setWhoAmI(
        {
          email     : "joe@blow.com",
          userId    : "Joe Blow",
          isAdmin   : false
        });

      // Adding comment to app.
      dbifSim.addComment(105, "I'm getting very test-y right now", null);
            
      var appInfo = dbifSim.getAppInfo(105, 
                                       false, 
                                       {
                                         // Requested Fields
                                         "comments" : "comments",
                                         "title"    : "title",
                                         "owner"    : "author",
                                         "uid"      : "uid"
                                       });
      
      this.assertInstance(appInfo, Object, "get app info");
      this.assert(appInfo.uid === 105, "correct app returned");
      
      this.assertKeyInMap("comments", appInfo, "comments were returned");
      this.assertArray(appInfo["comments"], "comments returned correctly");
      
      this.assertKeyInMap("author", appInfo, "requested fields successful");
      this.assert(typeof(appInfo["owner"]) === "undefined", 
                  "requested fields very successful");
      
    }
    
    
  }
});
