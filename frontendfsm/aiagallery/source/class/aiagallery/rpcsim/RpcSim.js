/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.rpcsim.RpcSim",
{
  extend  : qx.core.Object,
  type    : "singleton",

  include : 
  [
    aiagallery.rpcsim.MSimData,

    aiagallery.rpcsim.MVisitors,
    aiagallery.rpcsim.MApps,
    aiagallery.rpcsim.MTags
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);

        
    // Simulate the logged-in user
    this.setUserData("whoami", "joe@blow.com");

/*
    // Gain access to local storage
    var Storage = qx.bom.Cookie;
    
    // See if there's an existing database
    var s = Storage.get("aiagallery.db");
    
    // Did we find anything there?
    if (s)
    {
      // Yup. It's a JSON representation of our database. Parse it.
      this._db = qx.lang.Json.parse(s);
    }
    else
*/
    {
      this._db = aiagallery.rpcsim.RpcSim.DefaultDatabase;
    }
    
    // Prepare to store the database periodically
/*
    var timer = qx.util.TimerManager.getInstance();
    timer.start(function(userData, timerId)
                {
                  Storage.set("aiagallery.db",
                              qx.lang.Json.stringify(this._db));
                },
                5000,
                this,
                null,
                5000);
*/


    // Start up the RPC simulator
    new rpcjs.sim.Rpc(this.__services, "/rpc");
  },
  
  statics :
  {
    Status      : 
    {
      Banned  : 0,
      Pending : 1,
      Active  : 2
    },
    
    /** The default database, filled in in the defer() function */
    DefaultDatabase : null
  },

  members :
  {
    statusOrder : [ "Banned", "Pending", "Active" ],
    
    /**
     * Register a service name and function.
     *
     * @param serviceName {String}
     *   The name of this service within the aiagallery.features namespace.
     *
     * @param fService {Function}
     *   The function which implements the given service name.
     */
    registerService : function(serviceName, fService)
    {
      this.__services.aiagallery.features[serviceName] = 
        qx.lang.Function.bind(fService, this);
    },

    /**
     * Allow creating a more elaborate sample database
     *
     * @param db
     *   The replacement database, which must contain all of the requisite
     *   data as provided in the DefaultDatabase herein.
     */
    setDb : function(db)
    {
      this._db = db;
    },

    /** Remote procedure call services */
    __services : 
    {
      aiagallery :
      {
        features :
        {
        }
      }
    }
  },
  
  defer : function()
  {
    var bGenerateDB = false;
    if (bGenerateDB)
    {
      var data =
      {
        visitors : 
        {
          "jane@uphill.org" :
          {
            userId         : "jane@uphill.org",
            displayName    : "Jane Doe",
            permissions    : [],
            status         : aiagallery.rpcsim.RpcSim.Status.Active,
            recentSearches : [],
            recentViews    : []
          },

          "billy@thekid.edu" :
          {
            userId         : "billy@thekid.edu",
            displayName    : "Billy The Kid",
            permissions    : [],
            status         : aiagallery.rpcsim.RpcSim.Status.Active,
            recentSearches : [],
            recentViews    : []
          },

          "joe@blow.com" :
          {
            userId         : "joe@blow.com",
            displayName    : "Joe Blow",
            permissions    : [ "VISITOR EDIT" ],
            status         : aiagallery.rpcsim.RpcSim.Status.Active,
            recentSearches : [],
            recentViews    : []
          }
        },

        tags     : 
        {
          "*Featured*"        : { type : "special",   count : 1 },
          "Games"             : { type : "category",  count : 1 },
          "Educational"       : { type : "category",  count : 1 },
          "Development"       : { type : "category",  count : 1 },
          "Graphics"          : { type : "category",  count : 1 },
          "Internet"          : { type : "category",  count : 1 },
          "Multimedia"        : { type : "category",  count : 1 },
          "Bioscience"        : { type : "normal",    count : 1 },
          "Communications"    : { type : "normal",    count : 1 },
          "Computers"         : { type : "normal",    count : 1 },
          "Earth Science"     : { type : "normal",    count : 1 },
          "Energy"            : { type : "normal",    count : 1 },
          "Mathematics"       : { type : "normal",    count : 1 },
          "Oceanography"      : { type : "normal",    count : 1 },
          "Physical Sciences" : { type : "normal",    count : 1 },
          "Space"             : { type : "normal",    count : 1 },
          "Transportation"    : { type : "normal",    count : 1 },
          "Word Games"        : { type : "normal",    count : 1 },
          "K-12"              : { type : "normal",    count : 1 }
        },

        apps :
        {
        },

        downloads :
        {
        },

        comments :
        {
        },

        likes :
        {
        },

        flags :
        {
        }
      };

      // Gain easy access to the simulation data
      var simData = aiagallery.rpcsim.MSimData.Db;

      // Get the tag names into categories and tags arrays
      var categories = [];
      var tags = [];

      for (var tag in data.tags)
      {
        switch(data.tags[tag].type)
        {
        case "category":
          categories.push(tag);
          break;

        case "normal":
          tags.push(tag);
          break;
        }
      }

      // Get the list of potential application owners
      var owners = qx.lang.Object.getKeys(data.visitors);

      var rand = function(numChoices)
      {
        return Math.floor(Math.random() * numChoices);
      };

      var nextUid = 100;

      for (var app in simData.apps)
      {
        // We'll build our list of tags (both category and otherwise)
        var tagList = [];

        // Clone the category list
        var c = qx.lang.Array.clone(categories);

        // Select a category
        tagList.unshift(c[rand(c.length)]);

        // Do we want another category? Use a 1 in 10 chance.
        if (rand(10) == 0)
        {
          // Remove the previously-selected element as a choice now
          qx.lang.Array.remove(c, tagList[0]);

          // Get one more element
          tagList.push(c[rand(c.length)]);
        }

        // Clone the tags list
        var t = qx.lang.Array.clone(tags);

        for (var j = 0; j < 4; j++)
        {
          // With a 1 in 4 chance, add another tag
          if (rand(4) == 0)
          {
            tagList.unshift(t[rand(t.length)]);

            // Delete the used tag from the list
            qx.lang.Array.remove(t, tags[0]);
          }

          // If there are no more tags, we're done
          if (t.length == 0)
          {
            break;
          }
        }

        var thisData = simData.apps[app];
        var a = 
          {
            uid :   nextUid + "",
            owner : owners[rand(owners.length)],
            title : thisData.title,
            description : "The description of " + thisData.title,
            image1 : thisData.image1,
            image2 : null,
            image3 : null,
            previousAuthors : [],
            source : "var x = 'Hello world';",
            apk : null,
            tags : tagList,
            uploadTime : new Date(),
            numLiked : rand(50),
            numDownloads : rand(20),
            numViewed : rand(100),
            numComments : 0,
            status : aiagallery.rpcsim.RpcSim.Status.Active
          };

        // Save this record
        data.apps[nextUid++ + ""] = a;
      }

      // Save the just-built database for use.
      aiagallery.rpcsim.RpcSim.DefaultDatabase = data;

      // Display the data
      console.log(qx.lang.Json.stringify(data));
    }
    else
    {
      // Save the database from the MSimData mixin
      aiagallery.rpcsim.RpcSim.DefaultDatabase = aiagallery.rpcsim.MSimData.Db;
    }
  }
});
