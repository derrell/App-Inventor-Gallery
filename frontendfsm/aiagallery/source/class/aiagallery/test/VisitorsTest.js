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
    "test: Owner Id and Display Name exchange" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      console.log(dbifSim.whoAmI());
      console.log(dbifSim.__whoAmI);
      
      
    }
  }
});
