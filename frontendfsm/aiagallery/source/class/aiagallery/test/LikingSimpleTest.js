/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.LikingSimpleTest",
{
  extend : qx.dev.unit.TestCase,

  members :
  {

    "test: Simple Plus One Liking" : function()
    {
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();

      // We need an error object
      var error = new rpcjs.rpc.error.Error("2.0");
      
      // Adding a new app.
      var myAppData = dbifSim.addOrEditApp(null,
                                           {
                                             owner    : "me",
                                             description: "hello",
                                             title : "a title",
                                             tags :
                                             [
                                               "tag", 
                                               "anotherTag",
                                               "Development"
                                             ],
                                             source : "sources",
                                             image1 : "xxx"
                                           },
                                           error);

      // Was this app initialized correctly with zero likes?
      this.assert(myAppData.numLikes === 0, "Num likes correctly inited to 0");
      
      var newNumLikes = dbifSim.likesPlusOne(myAppData.uid, error);
      
      // Did the plus one go well?
      this.assert(newNumLikes === 1, "NumLikes correctly incremented");
      
      // Can we make a bad request?
      var badRequestResults = dbifSim.likesPlusOne(-1, error);
      
      // And does it return an error?
      this.assert(badRequestResults === error, "Bad like request returns"
                                               + " error appropriately");

    }
  }
});
