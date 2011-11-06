/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjFlags",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(uid)
  {
    // Pre-initialize the data
    this.setData(
      {
        "type"        : null,
        "app"         : null,
        "comment"     : null,
        "visitor"     : null,
        "timestamp"   : aiagallery.dbif.MDbifCommon.currentTimestamp(),
        "explanation" : null
      });

    // Call the superclass constructor
    this.base(arguments, "flags", uid);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "flags");

    var databaseProperties =
      {
        /** Type of flag ("App" = application, "Comment" = comment) */
        "type" : "String",

        /** UID of the AppData object which was flagged */
        "app" : "Key",

        /** Tree ID of the Comment object which was flagged */
        "comment" : "String",

        /** Id of the Visitor who flagged the application or comment */
        "visitor" : "String",

        /** Time the like occurred */
        "timestamp" : "Date",

        /** Explanation for why the application or comment was flagged */
        "explanation" : "String"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("flags",
                                                 databaseProperties);
  }
});
