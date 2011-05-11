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
    userService = UserServiceFactory.getUserService();
    whoami = userService.getCurrentUser();

    // Simulate the logged-in user
    this.setUserData("whoami", String(whoami));

    // Start up the App Engine RPC engine
    this.__rpcHandler = new rpcjs.appengine.Rpc(this.__services, "/rpc");
  },
  
  statics :
  {
    /**
     * The remote procedure code server for App Engine
     */
    __rpcHandler : null,

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
      var             i;
      var             Datastore;
      var             datastore;
      var             Query;
      var             query;
      var             preparedQuery;
      var             options;
      var             type;
      var             fields;
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
      query = new Query(type);

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
                  filterOp = Query.FilterOperator.LESS_THAN_OR_EQUAL;
                  break;
                  
                case "<":
                  filterOp = Query.FilterOperator.LESS_THAN;
                  break;
                  
                case "=":
                  filterOp = Query.FilterOperator.EQUAL;
                  break;
                  
                case ">":
                  filterOp = Query.FilterOperator.GREATER_THAN;
                  break;
                  
                case ">=":
                  filterOp = Query.FilterOperator.GREATER_THAN_OR_EQUAL;
                  break;
                  
                case "!=":
                  filterOp = Query.FilterOperator.NOT_EQUAL;
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
      propertyTypes = aiagallery.dbif.Entity.propertyTypes;
      fields = propertyTypes[type].fields;

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
        for (fieldName in fields)
        {
          // Map the Java field data to appropriate JavaScript data
          result[fieldName] =
            (function(value, type)
             {
               var             ret;
               var             Text;
               var             iterator;

               switch(type)
               {
                 case "Key":
                 case "String":
                   return(String(value));

                 case "LongString":
                   return value ? String(value.getValue()) : value;

                 case "Number":
                   return(Number(value));

                 case "KeyArray":
                 case "StringArray":
                 case "LongStringArray":
                 case "NumberArray":
                   if (value)
                   {
                     // Initialize the return array
                     ret = [];

                     // Determine the type of the elements
                     var elemType = type.replace(/Array/, "");
                     
                     // Convert the elements to their proper types
                     iterator = value.iterator();
                     while (iterator.hasNext())
                     {
                       // Call ourself with this element
                       ret.push(arguments.callee(iterator.next(), elemType));
                     }
                     
                     return ret;
                   }
                   else
                   {
                     return [];
                   }

                 default:
                   throw new Error("Unknown property type: " + type);
               }
             })(dbResult.getProperty(fieldName), fields[fieldName]);
        }

        // Save this result
        results.push(result);
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
      var             fields;
      var             data;
      
      // Ensure that there's either a real key or no key; not empty string
      if (key === "")
      {
        throw new Error("Found disallowed empty key");
      }

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
      fields = entity.getDatabaseProperties().fields;
      for (fieldName in fields)
      {
        // Map the Java field data to appropriate JavaScript data
        data =
          (function(value, type)
           {
             var             i;
             var             jArr;

             switch(type)
             {
               case "Key":
               case "String":
               case "Number":
                 return value;

               case "LongString":
                 var Text = Packages.com.google.appengine.api.datastore.Text;
                 return value ? new Text(value) : value;

               case "KeyArray":
               case "StringArray":
               case "LongStringArray":
               case "NumberArray":
                 jArr = new java.util.ArrayList();
                 for (i = 0; value && i < value.length; i++)
                 {
                   jArr.add(arguments.callee(value[i],
                                             type.replace(/Array/, "")));
                 }
                 return jArr;

               default:
                 throw new Error("Unknown property type: " + type);
             }
           })(entityData[fieldName], fields[fieldName]);

        // Save this result
        dbEntity.setProperty(fieldName, data);
      }

      // Save it to the database
      datastore = Datastore.DatastoreServiceFactory.getDatastoreService();
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
      datastore = Datastore.DatastoreServiceFactory.getDatastoreService();
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
    
    
    /**
     * Process a single request.
     *
     * @param jsonData {String}
     *   The data provide in a POST request
     *
     * @return {String}
     *   Upon success, the JSON-encoded result of the RPC request is returned.
     *   Otherwise, null is returned.
     */
    processRequest : function(jsonData)
    {
      return this.__rpcHandler.processRequest(jsonData);
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
