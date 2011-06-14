/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjTags",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(value)
  {
    // Pre-initialize the data
    this.setData(
      {
        "value" : null,
        "type"  : "normal",
        "count" : 1
      });

    // Use the "value" property as the entity key
    this.setEntityKeyProperty("value");
    
    // Call the superclass constructor
    this.base(arguments, "tags", value);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "tags");

    var databaseProperties =
      {
        /** The tag value */
        "value" : "String",

        /** The tag type (category, invisible [e.g. "featured"], normal) */
        "type"  : "String",
        
        /** The number of uses of this tag value */
        "count" : "Integer"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("tags",
                                                 databaseProperties,
                                                 "value");
  }
});
