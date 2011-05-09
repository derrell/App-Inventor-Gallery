/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#use(aiagallery.rpcsim.ObjAppData)
#use(aiagallery.rpcsim.ObjComments)
#use(aiagallery.rpcsim.ObjDownloads)
#use(aiagallery.rpcsim.ObjFlags)
#use(aiagallery.rpcsim.ObjLikes)
#use(aiagallery.rpcsim.ObjTags)
#use(aiagallery.rpcsim.ObjVisitors)
 */

qx.Class.define("aiagallery.rpcsim.Entity",
{
  extend : qx.core.Object,
  
  construct : function(entityType, entityKey)
  {
    var             queryResults;
    var             keyField;
    var             cloneObj;
    var             properties;

    // Call the superclass constructor
    this.base(arguments);
    
    // Save the entity type
    this.setEntityType(entityType);
    
    // Get the key field name.
    keyField = this.getEntityKeyProperty();
    
    // If an entity key was specified...
    if (typeof entityKey != "undefined")
    {
      // ... then query for the object.
      queryResults = aiagallery.rpcsim.Entity.query(
        this.constructor.classname,
        {
          type  : "element",
          field : keyField,
          value : entityKey
        });
      
      // Did we find anything there?
      if (queryResults.length == 0)
      {
        // Nope. Just set this object's key
        this.getData()[keyField] = entityKey;
      }
      else
      {
        // Set our object data to the data retrieved from the query
        this.setData(queryResults[0]);
        
        // It's not a brand new object
        this.setBrandNew(false);
      }
    }
  },

  properties :
  {
    /** A map containing the data for this entity */
    data :
    {
      init : null
    },

    /** Flag indicating that this entity was newly created */
    brandNew :
    {
      init  : true,
      check : "Boolean"
    },

    /**
     * The property name that is to be used as the database entity key (aka
     * primary key).
     */
    entityKeyProperty :
    {
      init  : "uid",
      check : "String"
    },

    /** Mapping from classname to type used in the database */
    entityType :
    {
      check    : "String",
      nullable : false
    },

    /*
     * The unique id to be used as the database entity key (aka primary key),
     * if no other property has been designated in entityKeyProperty as the
     * primary key.
     */
    uid :
    {
      init : null
    }
  },
  
  statics :
  {
    /** Map from classname to entity type */
    entityTypeMap : {},

    /** Assignment of property types for each entity class */
    propertyTypes : {},

    /** Register an entity type */
    registerEntityType : function(classname, entityType)
    {
      // Save this value in the map from classname to entity type
      aiagallery.rpcsim.Entity.entityTypeMap[classname] = entityType;
    },

    /** Register the property types for an entity class */
    registerPropertyTypes : function(entityType, propertyTypes, keyField)
    {
      // If there's no key field name specified...
      if (! keyField)
      {
        // Add "uid" to the list of database properties.
        propertyTypes["uid"] = "Key";
      }

      aiagallery.rpcsim.Entity.propertyTypes[entityType] = 
        {
          keyField      : keyField,
          fields        : propertyTypes
        };
    },

    /**
     * Function to query for objects.
     *
     * @param classname {String}
     *   The name of the class, descended from aiagallery.rpcsim.Entity, of
     *   the object type which is to be queried in the database.
     *
     * @param criteria {Map?}
     *   A (possibly recursive) map which contains the following members:
     *     type {String}
     *       "op" -- a logical operation. In this case, there must also be a
     *               "method" member which contains the logical operation to
     *               be performed. Currently, the only supported operations
     *               are "and" and "contains". There must also be a "children"
     *               member, which is an array of the critieria to which the
     *               specified operation is applied.
     *
     *       "element" -- Search by specific field in the object. The
     *                    "field" member must be provided, to specify which
     *                    field, and a "value" member must be specified, to
     *                    indicate what value must be in that field.
     *
     *   If no criteria is supplied (undefined or null), then all objects of
     *   the specified classname will be returned.
     *
     * @return {Array}
     *   An array of maps, i.e. native objects (not of Entity objects!)
     *   containing the data resulting from the query.
     */
    query : null,
    

    /**
     * Function to put an object to the database.
     *
     * @param entity {aiagallery.rpcsim.Entity}
     *   The object whose database properties are to be written out.
     */
    __put : null,


    /** Register a put and query function, specific to a database */
    registerDatabaseProvider : function(query, put, remove)
    {
      // Save the specified functions.
      aiagallery.rpcsim.Entity.query = query;
      aiagallery.rpcsim.Entity.__put = put;
      aiagallery.rpcsim.Entity.__remove = remove;
    }
  },

  members :
  {
    /**
     * Put the db property data in this object to the database. The properties
     * which are put are those which have member "db" : true.
     */
    put : function()
    {
      // Write this data 
      aiagallery.rpcsim.Entity.__put(this);
      
      // This entity is no longer brand new
      this.setBrandNew(false);
    },
    
    /**
     * Remove this entity from the database. 
     * 
     * NOTE: This object should no longer be used after having called this
     *       method!
     */
    removeSelf : function()
    {
      // Remove ourself from the database
      aiagallery.rpcsim.Entity.__remove(this);
      
      // Mark this entity as brand new again.
      this.setBrandNew(true);
    },

    /**
     * Provide the map of database properties and their types.
     *
     * @return {Map}
     *   A map where the key is a database property, and the value is its
     *   type. Valid types are "String", "Number", "Array", and "Key". The
     *   latter is database implementation dependent.
     */
    getDatabaseProperties : function()
    {
      return aiagallery.rpcsim.Entity.propertyTypes[this.getEntityType()];
    }
  }
});
