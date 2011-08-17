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
      var queryResults;
      
      // Get access to the RPC implementations. This includes the mixins for
      // all RPCs.
      var dbifSim = aiagallery.dbif.DbifSim.getInstance();
      
      // We need an error object
      var error = new rpcjs.rpc.error.Error("2.0");
      
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
            tags        : ["shooter", "shooting", "game", "Games"],
            source      : "somerandomstring"
          },
          
          {
            source      : "somerandomstring",
            owner       : "billy@thekid.edu",
            description : "This one's sexy and beautiful",
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
            description : "This one's not interesting in any way",
            title       : "Microsoft Windows for Android",
            tags        : ["Development", "broken"]
          }
        ];

      myApps.forEach(function(obj)
                     {
                         dbifSim.addOrEditApp(null, obj, error);
                     });

      // Test with one word present in 2 apps
      queryResults = dbifSim.keywordSearch("beautiful", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());

      this.assert(queryResults.length === 2,
                  "Returned correct # results with 1 keyword");

      // Test with 2 words present in 1 app, each present in 4 total
      queryResults = dbifSim.keywordSearch("this not", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assert(queryResults.length === 0,
                  "Should fail to return anything because both words are" +
                  " stop words");

      // Test with 2 words present in 1 app, each present in 3 total
      queryResults = dbifSim.keywordSearch("beautiful sexy", null, null, error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assert(queryResults.length === 3,
                  "Returned correct # results with 2 keywords");
    
      var firstResultDescription = queryResults[0]["description"];
      var descSplit = firstResultDescription.split(" ");
      
      // First result should contain both keywords
      this.assert(qx.lang.Array.contains(descSplit, "beautiful") &&
                  qx.lang.Array.contains(descSplit, "sexy"),
                  "Results ordered correctly for 2 keyword search");
      
      //Test with 1 word not present in any app
      queryResults = dbifSim.keywordSearch("meowmeowmeowcatshisss",
                                           null,
                                           null,
                                           error);

      // Ensure that an error was not returned
      this.assert(queryResults !== error,
                  "Error: " + error.getCode() + ": " + error.getMessage());
      
      this.assert(queryResults.length === 0, "Correctly returned zero results");
      
    }
  }
});  

