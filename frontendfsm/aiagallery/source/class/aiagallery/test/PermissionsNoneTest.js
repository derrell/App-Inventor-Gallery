/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.PermissionsNoneTest",
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
          permissions  : [],
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
    
    // This string is to be appended to assertions, to be specific about test conditions
    permissionLevel : "no permissions",
    
    setUp: function()
    {
      // Start the RPC simulator by getting its singleton instance
      this.dbif = aiagallery.dbif.DbifSim.getInstance();
      
      // Use a personalized database
      rpcjs.sim.Dbif.setDb(this.__db);
      
      this.currentPermissionsStr = "no permissions";
    },

    tearDown: function() 
    {
//      this.rpc.dispose();
    },
    
    "test: attempt to addOrEditApp with no permissions" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();      
           
      this.assert(aiagallery.dbif.MDbifCommon.authenticate("aiagallery.features.addOrEditApp"), "addOrEditApp with " + this.permissionLevel);
    },
   
    "test: MDBifCommon._deepPermissionCheck()" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();      
      
      
      
    }
    
    
  }
});
