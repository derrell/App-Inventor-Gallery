/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.DbifSim",
{
  extend  : rpcjs.sim.Dbif,
  type    : "singleton",

  include : 
  [
    aiagallery.dbif.MDbifCommon,
    aiagallery.dbif.MSimData
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments, "aiagallery", "/rpc");
        
    // Simulate the logged-in user
    this.setWhoAmI("joe@blow.com");
    
    // Simulate being the administrator
//    this.setIsAdmin(true);
  },
  
  defer : function()
  {
    // Save the database from the MSimData mixin
    rpcjs.sim.Dbif.Database = aiagallery.dbif.MSimData.Db;
    
    // Register our put & query functions
    rpcjs.dbif.Entity.registerDatabaseProvider(
      rpcjs.sim.Dbif.query,
      rpcjs.sim.Dbif.put,
      rpcjs.sim.Dbif.remove);
  }
});
