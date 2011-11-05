/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjComments",
{
  extend : aiagallery.dbif.Entity,
  
  // keyArr must be an array with 2 elements. The first element is
  // an appId and the second a treeId
  construct : function(keyArr)
  {
    // Pre-initialize the data
    this.setData(
      {
        "timestamp"       : aiagallery.dbif.MDbifCommon.currentTimestamp(),
        "numChildren"     : 0,
        "app"             : keyArr[0],
        "treeId"          : keyArr[1],
      	"status"          : aiagallery.dbif.Constants.Status.Active,
        "numCurFlags"     : 0
      });
    
    // Use appId and treeId are a composite key
    this.setEntityKeyProperty([ "app", "treeId" ]);
    
    // Call the superclass constructor
    this.base(arguments, "comments", keyArr);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "comments");
    
    var databaseProperties =
      {
        /** UID of the AppData object which was commented upon */
        "app" : "Key",

        /*
         * Hierarchy identifier to track comment threads. 
         *
         * See http://www.tetilab.com/roberto/pgsql/postgres-trees.pdf for an
         * explanation of the Genealogical Representation of Trees in
         * Databases which is being used here.  Note that we use fgID
         * representation, with 4 bytes per level, so we can represent 6.5E+08
         * direct replies to a single comment, which should be adequate for
         * our purposes. :-)
         */
        "treeId" : "String",
        
        /** How many direct responses does this comment have? */
        "numChildren" : "Integer",

        /** Id of the Visitor who made this comment */
        "visitor" : "String",

        /** Time the comment was made */
        "timestamp" : "Date",

        /** Text of this comment */
        "text" : "String",

        /** Status of this application (active, pending, banned) */
        "status" : "Integer",

        /** Total number of flags on this application */
        "numCurFlags" : "Integer"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("comments",
                                                 databaseProperties,
                                                 [ "app", "treeId" ]);
  }
});
