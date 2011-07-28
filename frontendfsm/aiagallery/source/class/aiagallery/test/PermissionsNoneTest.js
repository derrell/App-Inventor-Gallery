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
    setUp: function()
    {
      // Start the RPC simulator by getting its singleton instance
      this.dbif = aiagallery.dbif.DbifSim.getInstance();

    /*this.rpc = new qx.io.remote.Rpc();
      this.rpc.setUrl(aiagallery.main.Constant.SERVICES_URL);
      this.rpc.setTimeout(10000);
      this.rpc.setCrossDomain(false);
     
     */
      
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
           
      assert(dbifSim.addOrEditApp(null), "addOrEditApp with " + this.currentPermissionsStr);
    },
    "test: MDBifCommon._deepPermissionCheck()" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();      
      
      
      
    }
    
    
  }
});
