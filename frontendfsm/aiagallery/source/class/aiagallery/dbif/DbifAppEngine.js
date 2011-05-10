/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.DbifAppEngine",
{
  extend  : qx.core.Object,
  type    : "singleton",

  include : 
  [
    aiagallery.dbif.MVisitors,
    aiagallery.dbif.MApps,
    aiagallery.dbif.MTags
  ],
  
  construct : function()
  {
    var             UserServiceFactory;
    var             userService;
    var             whoami;

    // Call the superclass constructor
    this.base(arguments);

    // Find out who is logged in
    UserServiceFactory =
      Packages.com.google.appengine.api.users.UserServiceFactory;
    userService = UserService.getUserService();
    whoami = userService.getCurrentUser();

    // Simulate the logged-in user
    this.setUserData("whoami", String(whoami));

    // Start up the RPC simulator
    new rpcjs.sim.Rpc(this.__services, "/rpc");
  },
  
  statics :
  {
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
     * @param criteria
     *   See {@link aiagallery.dbif.Entity#query} for details.
     *
     * @return {Array}
     *   An array of maps, i.e. native objects (not of Entity objects!)
     *   containing the data resulting from the query.
     */
    query : function(classname, searchCriteria, resultCriteria)
    {
      var             Datastore;
      var             datastore;
      var             Query;
      var             query;
      var             preparedQuery;
      var             options;
      var             type;
      var             fieldNames;
      var             dbResult;
      var             dbResults;
      var             result;
      var             results;
      var             propertyTypes;
  
      // Get the entity type
      type = aiagallery.dbif.Entity.entityTypeMap[classname];
      if (! type)
      {
        throw new Error("No mapped entity type for " + classname);
      }
      
      // Initialize our results array
      results = [];

      // Get the datastore service
      Datastore = Packages.com.google.appengine.api.datastore;
      datastore = Datastore.DatastoreServiceFactory.getDatastoreService();

      // Create a new query
      Query = Datastore.Query;
      query = new Query();

      // If they're not asking for all objects, build a criteria predicate.
      if (searchCriteria)
      {
          (function(criterium)
            {
              var             filterOp;

              switch(criterium.type)
              {
              case "op":
                switch(criterium.method)
                {
                case "and":
                  // Generate the conditions specified in the children
                  criterium.children.forEach(arguments.callee);
                  break;

                default:
                  throw new Error("Unrecognized criterium method: " +
                                  criterium.method);
                }
                break;

              case "element":
                // Map the specified filter operator to the db's filter ops.
                filterOp = criterium.filterOp || "=";
                switch(filterOp)
                {
                case "<=":
                  filterOp = Query.FilterOperation.LESS_THAN_OR_EQUAL;
                  break;
                  
                case "<":
                  filterOp = Query.FilterOperation.LESS_THAN;
                  break;
                  
                case "=":
                  filterOp = Query.FilterOperation.EQUAL;
                  break;
                  
                case ">":
                  filterOp = Query.FilterOperation.GREATER_THAN;
                  break;
                  
                case ">=":
                  filterOp = Query.FilterOperation.GREATER_THAN_OR_EQUAL;
                  break;
                  
                case "!=":
                  filterOp = Query.FilterOperation.NOT_EQUAL;
                  break;
                  
                default:
                  throw new Error("Unrecognized logical operation: " +
                                  criterium.filterOp);
                }

                // Add a filter using the provided parameters
                query.addFilter(criterium.field, 
                                filterOp,
                                criterium.value);
                break;

              default:
                throw new Error("Unrceognized criterium type: " +
                                criterium.type);
              }

              return ret;
            })(searchCriteria);
      }
      
      // Prepare to issue a query
      preparedQuery = datastore.prepare(query);
      
      // Assume the default set of result criteria (no limits, offset=0)
      options = Datastore.FetchOptions.Builder.withDefaults();
      
      // If there are any result criteria specified...
      if (resultCriteria)
      {
        // ... then go through the criteria list and handle each.
        resultCriteria.forEach(
          function(criterium)
          {
            switch(criterium.type)
            {
            case "limit":
              options.withLimit(criterium.value);
              break;
              
            case "offset":
              options.withOffset(criterium.value);
              break;
              
            default:
              throw new Error("Unrecognized result criterium type: " +
                              criterium.type);
            }
          });
      }

      // Get the field names for this entity type
      fieldNames = aiagallery.dbif.Entity.propertyTypes[type];

      // Issue the query
      dbResults = preparedQuery.asIterator(options);
      
      // Process the query results
      while (dbResults.hasNext())
      {
        // Initialize a map for the result data
        result = {};
        
        // Get the next result
        dbResult = dbResults.next();
        
        // Pull all of the result properties into the entity data
        propertyTypes = aiagallery.dbif.Entity.propertyTypes;
        fieldNames.forEach(
          function(fieldName)
          {
            // Map the Java field data to appropriate JavaScript data
            result[fieldName] =
              (function(value)
               {
                 switch(propertyTypes[type].fields[criterium.field])
                 {
                   case "Key":
                   case "String":
                     return(String(value));

                   case "Number":
                     return(Number(value));

                   case "Array":
                     return value.map(arguments.callee);

                   default:
                     throw new Error("Unknown property type: " + type);
                 }
               })(dbResult.getProperty(fieldName));
        
            // Save this result
            results.push(result);
          });
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
      var             dbKey;
      var             dbEntity;
      var             datastore;
      var             Datastore;
      var             entityData = entity.getData();
      var             key = entityData[entity.getEntityKeyProperty()];
      var             type = entity.getEntityType();
      var             propertyName;
      
      // If there's no key yet...
      if (typeof(key) == "undefined" || key === null)
      {
        // Generate a new key
        key = String(aiagallery.dbif.DbifAppEngine.__nextKey++);
        
        // Save this key in the key field
        entityData[entity.getEntityKeyProperty()] = key;
      }

      // Create the database key value
      Datastore = Packages.com.google.appengine.api.datastore;
      dbKey = Datastore.KeyFactory.createKey(entity.getEntityType(), key);

      // Create an App Engine entity to store in the database
      dbEntity = new Packages.com.google.appengine.api.datastore.Entity(dbKey);

      // Add each property to the database entity
      for (propertyName in entity.getDatabaseProperties())
      {
        // Add this property value to the data to be saved to the database.
        dbEntity.setProperty(propertyName, entityData[propertyName]);
      }
      
      // Save it to the database
      datastore = Datastore.DataServiceFactory.getDatastoreService();
      datastore.put(dbEntity);
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
      var             dbKey;
      var             datastore;
      var             Datastore;
      
      // Create the database key value
      Datastore = Packages.com.google.appengine.api.datastore;
      dbKey = Datastore.KeyFactory.createKey(type, key);

      // Remove this entity from the database
      datastore = Datastore.DataServiceFactory.getDatastoreService();
      datastore["delete"](dbKey);
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
    // Register our put & query functions
    aiagallery.dbif.Entity.registerDatabaseProvider(
      aiagallery.dbif.DbifAppEngine.query,
      aiagallery.dbif.DbifAppEngine.put,
      aiagallery.dbif.DbifAppEngine.remove);
  }
});
