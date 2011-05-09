/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.rpcsim.ObjLikes",
{
  extend : aiagallery.rpcsim.Entity,
  
  construct : function(uid)
  {
    // Pre-initialize the data
    this.setData(
      {
        "app"       : null,
        "visitor"   : null,
        "timestamp" : new Date()
      });

    // Call the superclass constructor
    this.base(arguments, "likes", uid);
  },
  
  defer : function(clazz)
  {
    aiagallery.rpcsim.Entity.registerEntityType(clazz.classname, "likes");

    var databaseProperties =
      {
        /** UID of the AppData object which was liked */
        "app" : "Key",

        /** Id of the Visitor who liked the application */
        "visitor" : "String",

        /** Time the like occurred */
        "timestamp" : "String"
      };

    // Register our property types
    aiagallery.rpcsim.Entity.registerPropertyTypes("likes",
                                                   databaseProperties);
  }
});
