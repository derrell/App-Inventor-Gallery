/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjSearch",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(keyArr)
  {
    // Need all data for the key regardless, so might as well store it
    this.setData(
      {
        "word"     : keyArr[0],
        "appId"    : keyArr[1],
        "appField" : keyArr[2]
      });

    // Use the composite of "word", "appId", and "appField" properties as 
    // the entity key
    this.setEntityKeyProperty(["word", "appId", "appField"]);
    
    // Call the superclass constructor
    this.base(arguments, "search", keyArr);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "search");

    var databaseProperties =
      {
        /** The word value */
        "word" : "String",

        /** The App in which this word appears */
        "appId"  : "Key",
                
        /** The App data field within which this word appeared */
        "appField" : "String"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("search",
                                                 databaseProperties,
                                                 ["word", "appId", "appField"]);
  }
});
