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
    aiagallery.rpcsim.MVisitors,
    aiagallery.rpcsim.MApps
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);

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
    /** The whole database */
    aiagallery.rpcsim.RpcSim.DefaultDatabase =
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

        "joe@blow.com" :
        {
          userId         : "joe@blow.com",
          displayName    : "Joe Blow",
          permissions    : [ "VISITOR VIEW" ],
          status         : aiagallery.rpcsim.RpcSim.Status.Active,
          recentSearches : [],
          recentViews    : []
        }
      },

      tags     : 
      {
        "_Featured"   : { type : "invisible" },
        "Games"       : { type : "category" },
        "Educational" : { type : "category" },
        "Word Games"  : { type : "normal" },
        "K-12"        : { type : "normal" }
      },

      apps :
      {
        "app1" :
        {
          uid             : "app1",
          owner           : "joe@blow.com",
          title           : "Hangman",
          description     : "The classic game of Hangman",
          image1          : null,
          image2          : null,
          image3          : null,
          previousAuthors : [],
          source          : "var word = 'The word is \"Explanation\".';",
          executable      : null,
          tags            : [ "Games", "Word Games" ],
          uploadTime      : new Date(2010, 5, 20, 14, 23, 42, 0),
          numLikes        : 0,
          numDownloads    : 0,
          numViewed       : 0,
          numComments     : 0,
          status          : aiagallery.rpcsim.RpcSim.Status.Active
        },

        "app2" :
        {
          uid             : "app2",
          owner           : "jane@uphill.org",
          title           : "Math Tutor",
          description     : "Learn to add, subtract, multiply, and divide",
          image1          : null,
          image2          : null,
          image3          : null,
          previousAuthors : [],
          source          : "var sum = 2 + 3;",
          exe             : null,
          tags            : [ "Educational", "K-12", "_Featured" ],
          uploadTime      : new Date(2011, 3, 9, 03, 45, 33, 0),
          numLikes        : 0,
          numDownloads    : 0,
          numViewed       : 0,
          numComments     : 0,
          status          : aiagallery.rpcsim.RpcSim.Status.Active
        }
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
  }
});
