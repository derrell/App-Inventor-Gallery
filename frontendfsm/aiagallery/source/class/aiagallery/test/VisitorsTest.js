/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.VisitorsTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
/*
    "test: Owner Id and Display Name exchange" : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      console.log(dbifSim.whoAmI());
      console.log(dbifSim.__whoAmI);
      
      // THIS TEST DOES NOTHING
      this.assertEquals("a valid test", "a test of nothing");
    },
*/
    
    "test: edit profile with displayName" : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      // Log in as a known existing user
      dbifSim.setWhoAmI(
        {
          email     : "joe@blow.com",
          userId    : "Joe Blow",
          isAdmin   : false
        });
      
      // We need an error object
      var error = new rpcjs.rpc.error.Error("2.0");

      var result = dbifSim.editProfile(
        {
          "displayName" : "Cokehead"
        },
        error);
      
      // Retrieve the visitor object for Joe
      var joe = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                        dbifSim.getWhoAmI().email)[0];
      
      // Ensure that his display name is what it should be
      this.assertEquals("Cokehead", joe.displayName);
    }
  }
});
