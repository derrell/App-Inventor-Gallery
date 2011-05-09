/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.rpcsim.ObjDownloads",
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
    this.base(arguments, "downloads", uid);
  },
  
  defer : function(clazz)
  {
    aiagallery.rpcsim.Entity.registerEntityType(clazz.classname, "downloads");

    var databaseProperties =
      {
        /** UID of the AppData object which was downloaded */
        "app" : "Key",

        /** Id of the Visitor who downloaded the application */
        "visitor" : "String",

        /** Time the download was initiated */
        "timestamp" : "String"
      };

    // Register our property types
    aiagallery.rpcsim.Entity.registerPropertyTypes("downloads",
                                                   databaseProperties);
  }
});
