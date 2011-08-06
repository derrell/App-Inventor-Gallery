/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.MobileRequestTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {
    "test: Mobile Request Interface" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      var uid;
      var developer;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");
      
      // testing all
      mobileRequest = dbifSim.mobileRequest("all:0:1:asc:uid");
      
      this.assertArray(mobileRequest, "mobile request all returns array");

      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile all");
      // testing tag
      mobileRequest = dbifSim.mobileRequest("tag:Games:0:1");
      
      this.assertArray(mobileRequest, "mobile request tag returns array");
      
      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile tag");
      
      // testing featured
      mobileRequest = dbifSim.mobileRequest("featured:0:1:desc:uid");
      
      this.assertArray(mobileRequest, "mobile request featured returns array");
      
      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile featured has uid");
      
      developer = mobileRequest[0]["owner"];

      // testing by_developer
      mobileRequest = dbifSim.mobileRequest("by_developer:"+developer+":0:1");
      
      this.assertArray(mobileRequest, "mobile request developer returns array");
      
      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile developer");
     
      // testing getinfo
     
      uid = mobileRequest[0].uid
      
      mobileRequest = dbifSim.mobileRequest("getinfo:"+uid);
      
      this.assertObject(mobileRequest, "mobile request getinfo returns array");
      
      this.assertKeyInMap( "owner",
                           mobileRequest,
                           "apps retrieved from mobile getinfo");

      // testing bad parameter type
      
      mobileRequest = dbifSim.mobileRequest("all:uid", error);
      
      
      this.assert(mobileRequest.basename === "Error", "bad request returns" + 
                 "error");
      
    }
  }
});
