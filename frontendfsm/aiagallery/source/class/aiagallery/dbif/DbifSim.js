/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.DbifSim",
{
  extend  : qx.core.Object,
  type    : "singleton",

  include : 
  [
    aiagallery.dbif.MSimData,

    aiagallery.dbif.MVisitors,
    aiagallery.dbif.MApps,
    aiagallery.dbif.MTags
  ],
  
  construct : function()
  {
    // Call the superclass constructor
    this.base(arguments);

    // Give object access to the database
    this._db = aiagallery.dbif.DbifSim.Database;
        
    // Simulate the logged-in user
    this.setUserData("whoami", "joe@blow.com");

    // Start up the RPC simulator
    new rpcjs.sim.Rpc(this.__services, "/rpc");
  },
  
  statics :
  {
    /** The default database, filled in in the defer() function */
    Database : null,
    
    /** 
     * The next value to use for an auto-generated key for an entity
     */
    __nextKey : 0,

    
    /**
     * Query for all entities of a given class/type, given certain criteria.
     *
     * @param classname {String}
     *   The name of the class, descended from aiagallery.dbif.Entity, of
     *   the object type which is to be queried in the database.
     *
     * @param searchCriteria
     *   See {@link aiagallery.dbif.Entity#query} for details.
     *
     * @param resultCriteria
     *   See {@link aiagallery.dbif.Entity#query} for details.
     *
     * @return {Array}
     *   An array of maps, i.e. native objects (not of Entity objects!)
     *   containing the data resulting from the query.
     */
    query : function(classname, searchCriteria, resultCriteria)
    {
      var             qualifies;
      var             builtCriteria;
      var             dbObjectMap;
      var             type;
      var             entry;
      var             propertyName;
      var             result;
      var             results;
      var             entity;
      var             clone;
      var             val;
      
      // Get the entity type
      type = aiagallery.dbif.Entity.entityTypeMap[classname];
      if (! type)
      {
        throw new Error("No mapped entity type for " + classname);
      }
      
      // Get the database sub-section for the specified classname/type
      dbObjectMap = aiagallery.dbif.DbifSim.Database[type];

      // Initialize our results array
      results = [];

      // If they're not asking for all objects, build a criteria predicate.
      if (searchCriteria)
      {
        builtCriteria =
          (function(criterium)
            {
              var             i;
              var             ret = "";
              var             propertyTypes;

              switch(criterium.type)
              {
              case "op":
                switch(criterium.method)
                {
                case "and":
                  // Generate the conditions
                  ret += "(";
                  for (i = 0; i < criterium.children.length; i++)
                  {
                    ret += arguments.callee(criterium.children[i]);
                    if (i < criterium.children.length - 1)
                    {
                      ret += " && ";
                    }
                  }
                  ret += ")";
                  break;

                default:
                  throw new Error("Unrecognized criterium method: " +
                                  criterium.method);
                }
                break;

              case "element":
                // Determine the type of this field
                propertyTypes = aiagallery.dbif.Entity.propertyTypes;
                switch(propertyTypes[type].fields[criterium.field])
                {
                case "Key":
                case "String":
                case "LongString":
                  ret += 
                    "entry[\"" + criterium.field + "\"] === " +
                    "\"" + criterium.value + "\" ";
                  break;

                case "Number":
                  ret +=
                    "entry[\"" + criterium.field + "\"] === " + criterium.value;
                  break;

                case "KeyArray":
                case "StringArray":
                case "LongStringArray":
                  ret +=
                  "qx.lang.Array.contains(entry[\"" + 
                    criterium.field + "\"], " + "\"" + criterium.value + "\")";
                  break;

                case "NumberArray":
                  ret +=
                  "qx.lang.Array.contains(entry[\"" + 
                    criterium.field + "\"], " + criterium.value + ")";
                  break;

                default:
                  throw new Error("Unknown property type: " + type);
                }
                break;

              default:
                throw new Error("Unrceognized criterium type: " +
                                criterium.type);
              }

              return ret;
            })(searchCriteria);

        // Create a function that implements the specified criteria
        qualifies = new Function(
          "entry",
          "return (" + builtCriteria + ");");
      }
      else
      {
        // They want all entities of the specified type.
        qualifies = function(entity) { return true; };
      }
      
      for (entry in dbObjectMap)
      {
        if (qualifies(dbObjectMap[entry]))
        {
          // Make a deep copy of the results
          result = qx.util.Serializer.toNativeObject(dbObjectMap[entry]);
          results.push(result);
        }
      }
      
      // Give 'em the query results!
      return results;
    },


    /**
     * Put an entity to the database. If the key field is null or undefined, a
     * key is automatically generated for the entity.
     *
     * @param entity {aiagallery.dbif.Entity}
     *   The entity to be made persistent.
     */
    put : function(entity)
    {
      var             data = {};
      var             entityData = entity.getData();
      var             key = entityData[entity.getEntityKeyProperty()];
      var             type = entity.getEntityType();
      var             propertyName;
      
      // If there's no key yet...
      if (typeof(key) == "undefined" || key === null)
      {
        // Generate a new key
        key = String(aiagallery.dbif.DbifSim.__nextKey++);
        
        // Save this key in the key field
        entityData[entity.getEntityKeyProperty()] = key;
      }

      // Create a simple map of properties and values to be put in the database
      for (propertyName in entity.getDatabaseProperties())
      {
        // Add this property value to the data to be saved to the database.
        data[propertyName] = entityData[propertyName];
      }
      
      // Save it to the database
      aiagallery.dbif.DbifSim.Database[type][key] = data;
    },
    

    /**
     * Remove an entity from the database
     *
     * @param entity {aiagallery.dbif.Entity}
     *   An instance of the entity to be removed.
     */
    remove : function(entity)
    {
      var             entityData = entity.getData();
      var             key = entityData[entity.getEntityKeyProperty()];
      var             type = entity.getEntityType();
      
      delete aiagallery.dbif.DbifSim.Database[type][key];
    }
  },

  members :
  {
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
    // Save the database from the MSimData mixin
    aiagallery.dbif.DbifSim.Database = aiagallery.dbif.MSimData.Db;
    
    // Register our put & query functions
    aiagallery.dbif.Entity.registerDatabaseProvider(
      aiagallery.dbif.DbifSim.query,
      aiagallery.dbif.DbifSim.put,
      aiagallery.dbif.DbifSim.remove);
  }
});
