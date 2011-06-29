/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjVisitors",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(id)
  {
    var initialData;

    // Pre-initialize the data
    this.setData(
      {
        "id"             : id,
        "displayName"    : null,
        "permissions"    : [],
        "status"         : aiagallery.dbif.Constants.Status.Active,
        "recentSearches" : [],
        "recentViews"    : []
      });

    // Use the "id" property as the entity key
    this.setEntityKeyProperty("id");
    
    // Call the superclass constructor
    this.base(arguments, "visitors", id);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "visitors");

    var databaseProperties =
      {
        /** The user's email address */
        "id" : "String",

        /** How the user's name is displayed in the gallery */
        "displayName" : "String",

        /** A list of permissions assigned to this user */
        "permissions" : "StringArray",

        /** Active, Pending, or Banned (by their numeric values) */
        "status" : "Integer",

        /** A list of the user's recent searches */
        "recentSearches" : "StringArray",

        /** A list of the user's recent application views */
        "recentViews" : "KeyArray"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("visitors",
                                                 databaseProperties,
                                                 "id");
  }
});
