/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.test.KeywordSearchTest",
{
  extend : qx.dev.unit.TestCase,
  
  members :
  {
    "test: Keyword Search" : function()
    {
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      dbifSim.setWhoAmI(
        {
          email : "billy@thekid.edu",
          isAdmin: false,
          logoutUrl: "undefined",
          permissions: [],
          userId :  "Billy The Kid"
        });

      // Adding a bunch of Apps with various words in their text fields

      // Handcrafting a bunch of Apps with various words in their text fields
      var myApps = 
        [
          {
            owner       : "billy@thekid.edu",
            description : "This one's beautiful",
            title       : "The Shooting Game",
            tags        : ["shooter", "shooting", "game", "Games"]
          },
          
          {
            owner       : "billy@thekid.edu",
            description : "This one's sexy and beautiful",
            title       : "Your Mother Jokes",
            tags        : ["funny"]
          },

          {
            owner       : "billy@thekid.edu",
            description : "This one's sexy",
            title       : "Laughapalooza",
            tags        : ["Educational"]
          },
            
          {
            owner       : "billy@thekid.edu",
            description : "This one's not interesting in any way",
            title       : "Microsoft Windows for Android",
            tags        : ["Development", "broken"]
          }
        ];

      myApps.forEach(function(obj)
                     {
                       var somedata = dbifSim.addOrEditApp(null, obj);
console.log(somedata);
                     });
      console.log("KeywordSearch: beautiful");
      console.log(dbifSim.keywordSearch("beautiful"));
    }
  }
});  

