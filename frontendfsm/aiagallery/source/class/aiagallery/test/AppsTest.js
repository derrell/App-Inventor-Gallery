/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.MAppsTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testAddAndDeleteApp : function()
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
    
    testGetAppListAll : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      var appList = dbifSim.getAppListAll(false);
      
      this.assertInteger(appList.apps[0].uid, "retrieving list of all apps");
    },
    
    testRequestedFields : function()
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
      
      var expectedResult = 
      {
        field1 : "Hello,",
        fieldInfinity : "unimportant"
      };
      
      aiagallery.dbif.MApps._requestedFields(myApp, requestedFields);
      
      this.assertJsonEquals(myApp, expectedResult, "requested fields");
    },
    
    testGetAppInfo : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      var appInfo = dbifSim.getAppInfo(105, false);
      
      this.assertInstance(appInfo, Object, "get app info");
      this.assert(parseInt(appInfo.uid,10) == 105, "correct app returned");
    }
    
    
  }
});