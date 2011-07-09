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
        
    if (true)
    {
      // Save the logged-in user
      this.setWhoAmI(
        {
          email   : "jarjar@binks.org",
          userId  : "obnoxious",
          isAdmin : true
        });
    }
    else
    {
      // Save the logged-in user
      this.setWhoAmI(
        {
          email   : "joe@blow.com",
          userId  : "Joey",
          isAdmin : false
        });
    }
  },
  
  defer : function()
  {
    // Retrieve the database from Web Storage, if such exists.
    if (typeof window.localStorage !== "undefined")
    {
      if (typeof localStorage.simDB == "string")
      {
        qx.Bootstrap.debug("Reading DB from Web Storage");
        rpcjs.sim.Dbif.setDb(qx.lang.Json.parse(localStorage.simDB));
      }
      else
      {
        // No database yet stored. Retrieve the database from the MSimData mixin
        qx.Bootstrap.debug("No database yet. Using new SIM database.");
        rpcjs.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
      }
    }
    else
    {
      // Retrieve the database from the MSimData mixin
      qx.Bootstrap.debug("No Web Storage available. Using new SIM database.");
      rpcjs.sim.Dbif.setDb(aiagallery.dbif.MSimData.Db);
    }
    
    // Register our put & query functions
    rpcjs.dbif.Entity.registerDatabaseProvider(
      rpcjs.sim.Dbif.query,
      rpcjs.sim.Dbif.put,
      rpcjs.sim.Dbif.remove);
  }
});
