/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.Base160Test",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    testNumToBase160 : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      var zero = dbifSim._numToBase160(0);
      var one = dbifSim._numToBase160(1);
      var onefiftynine = dbifSim._numToBase160(159);
      var onesixty = dbifSim._numToBase160(160);
      this.assertEquals("0000", zero, "zero");
      this.assertEquals("0001", one, "one");
      this.assertEquals("000" + String.fromCharCode(255), onefiftynine, "159");
      this.assertEquals("0010", onesixty, "160");
    },
    
    testIncrementBase160 : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      var zero = dbifSim._numToBase160(0);
      var one = dbifSim._numToBase160(1);
      var onefiftynine = dbifSim._numToBase160(159);
      var onesixty = dbifSim._numToBase160(160);
      this.assertEquals(one, dbifSim._incrementBase160(zero), "zero + 1");
      this.assertEquals(onesixty,
                        dbifSim._incrementBase160(onefiftynine), 
                        "159 + 1");
    }
  }
});
