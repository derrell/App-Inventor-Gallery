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
    "test: Mobile Request all" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");
      
      // testing all
      mobileRequest = dbifSim.mobileRequest("all:0:1:asc:uid", error);
      
      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertArray(mobileRequest, "mobile request all returns array");

      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile all");

      // Now a bad request
      mobileRequest = dbifSim.mobileRequest("all:0:uid:uid", error);      
      
      // Ensure that an error WAS returned on bad request
      this.assert(mobileRequest === error,
                 "Error not properly returned from bad request all!");

    },
    
    "test: Mobile Request tag" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");

      // testing tag
      mobileRequest = dbifSim.mobileRequest("tag:Games:0:1", error);

      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      
      this.assertArray(mobileRequest, "mobile request tag returns array");
      
      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile tag");
      

      // Now a bad request
      mobileRequest = dbifSim.mobileRequest("tag:schmoooch:abcd", error);      
      
      // Ensure that an error WAS returned on bad request
      this.assert(mobileRequest === error,
                 "Error not properly returned from bad request tag!");


    },
    
    "test: Mobile Request featured" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");

      // testing featured
      mobileRequest = dbifSim.mobileRequest("featured:0:1:desc:uid", error);
      
      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertArray(mobileRequest, "mobile request featured returns array");
      
      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile featured has uid");


      // Now a bad request
      mobileRequest = dbifSim.mobileRequest("featured:0:awef", error);      
      
      // Ensure that an error WAS returned on bad request
      this.assert(mobileRequest === error,
                 "Error not properly returned from bad request featured!");

      
    },
    
    "test: Mobile Request developer" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      var developer;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");
      
      // testing by_developer
      mobileRequest = dbifSim.mobileRequest("by_developer:Joe Blow:0:1",
                                           error);

      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      
      this.assertArray(mobileRequest, "mobile request developer returns array");
      
      this.assertKeyInMap( "uid",
                           mobileRequest[0],
                           "apps retrieved from mobile developer");

      // Now a bad request
      mobileRequest = dbifSim.mobileRequest("by_developer:Joe Blow:badef", error);      
      
      // Ensure that an error WAS returned on bad request
      this.assert(mobileRequest === error,
                 "Error not properly returned from bad request developer!");

    },
    
    "test: Mobile Request getinfo" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      var uid;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");

      // testing getinfo
     
      // Need an app uid
      uid = dbifSim.mobileRequest("featured:0:1:desc:uid",
                                 error)[0]["uid"];

      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
     
      mobileRequest = dbifSim.mobileRequest("getinfo:"+uid, error);
      
      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertObject(mobileRequest, "mobile request getinfo returns object");
      
      this.assertKeyInMap( "owner",
                           mobileRequest,
                           "apps retrieved from mobile getinfo");

      // Now a bad request
      mobileRequest = dbifSim.mobileRequest("getinfo:abcd", error);      
      
      // Ensure that an error WAS returned on bad request
      this.assert(mobileRequest === error,
                 "Error not properly returned from bad request getinfo!");




    },
    
    "test: Mobile Request search" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      var uid;
      var developer;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");
      
      //FIXXXXX
            
      dbifSim.setWhoAmI(
        {
          email : "billy@thekid.edu",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          userId :  "Billy The Kid"
        });

      // Handcrafting a bunch of Apps with various words in their text fields
      var myApps = 
        [
          {
            owner       : "billy@thekid.edu",
            description : "This one's beautiful",
            title       : "The Shooting Game",
            tags        : ["shooter", "shooting", "game", "Games"],
            source      : "somerandomstring"
          },
          
          {
            source      : "somerandomstring",
            owner       : "billy@thekid.edu",
            description : "This one's scoop and poop",
            title       : "Your Mother Jokes",
            tags        : ["funny"]
          },

          {
            source      : "somerandomstring",
            owner       : "billy@thekid.edu",
            description : "This one's sexy",
            title       : "Laughapalooza",
            tags        : ["Educational"]
          },
            
          {
            source      : "somerandomstring",
            owner       : "billy@thekid.edu",
            description : "This one's scoop interesting in any way",
            title       : "Microsoft Windows for Android",
            tags        : ["Development", "broken"]
          }
        ];

      myApps.forEach(function(obj)
                     {
                         dbifSim.addOrEditApp(null, obj, error);
                     });


      
      mobileRequest = dbifSim.mobileRequest("search:poop scoop", error);

      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assertArray(mobileRequest, "mobile request getinfo returns array");
      
      this.assert( "This one's scoop and poop" ===
                   mobileRequest[0]["description"],
                   "First result search correct");
      
      this.assert( "This one's scoop interesting in any way" ===
                   mobileRequest[1]["description"],
                   "Second result search correct");
      
      mobileRequest = dbifSim.mobileRequest("search:Laughapalooza", error);

      // Ensure that an error was not returned
      this.assert(mobileRequest !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assertArray(mobileRequest, "mobile request getinfo returns array");

      this.assert( "This one's sexy" ===
                   mobileRequest[0]["description"],
                   "third result search correct");
      
      mobileRequest = dbifSim.mobileRequest("search:someinnaneword", error);
      
      this.assert( mobileRequest.length === 0 , "bad search query returned"
                                                + " zero results");



      // Now a bad request
      mobileRequest = dbifSim.mobileRequest("search:", error);      
      
      // Ensure that an error WAS returned on bad request
      this.assert(mobileRequest === error,
                 "Error not properly returned from bad request 'search'!");

    },
    
    
    "test: Mobile Request bad parameters fail" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      var mobileRequest;
      
      // Need an error object to call RPCs with
      var error = new rpcjs.rpc.error.Error("2.0");

      // testing bad parameter type
      
      mobileRequest = dbifSim.mobileRequest("all:uid", error);
      
      // Ensure that an error was returned
      this.assert(mobileRequest === error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
    }
  }
});
