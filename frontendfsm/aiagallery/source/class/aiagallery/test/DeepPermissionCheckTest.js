/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.DeepPermissionCheckTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    __db : {
      
      visitors:
      {
        "jarjar@binks.org" :
        {
          displayName  : "mynewdisplayname",
          id           : "jarjar@binks.org",
          permissions  : ["addOrEditApp"],
          status       : 2
        }
        
      
      },
      tags:     {},
      search:   {},
      likes:    {},
      flags:    {},
      downloads:{},
      comments: {},
      apps:     {}
     
    },

    // Instantiate this to aiagalelry.dbif.DbifSim.getInstance()
    dbifSim : null,
    
    setUp: function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.      
      this.dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      this.dbifSim.setWhoAmI(
        {
          email : "jarjar@binks.org",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          userId :  "nameSetWhoAmI"
        });
      
      // Use a personalized database
      rpcjs.sim.Dbif.setDb(this.__db);
      
    },

    tearDown: function() 
    {
      // Reset the db for other tests
      rpcjs.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
    },
    
    "test: MDBifCommon._deepPermissionCheck()" : function()
    {
      this.assert(aiagallery.dbif.MDbifCommon._deepPermissionCheck("addOrEditApp"),
                  "permission check found permission properly");
      
      this.assertFalse(aiagallery.dbif.MDbifCommon._deepPermissionCheck("getAppInfo"),
                       "permission check failed appropriately");
    }
  }
});

    
