/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.ObjAppData",
{
  extend : aiagallery.dbif.Entity,
  
  construct : function(uid)
  {
    // Pre-initialize the data
    this.setData(
      {
        "owner"           : null,
        "title"           : null,
        "description"     : null,
        "image1"          : null,
        "image2"          : null,
        "image3"          : null,
        "previousAuthors" : null,
        "source"          : null,
        "apk"             : null,
        "tags"            : [],
        "uploadTime"      : null,
        "numLikes"        : 0,
        "numDownloads"    : 0,
        "numViewed"       : 0,
        "numComments"     : 0,
        "status"          : aiagallery.dbif.Constants.Status.Active
      });

    // Call the superclass constructor
    this.base(arguments, "apps", uid);
  },
  
  defer : function(clazz)
  {
    aiagallery.dbif.Entity.registerEntityType(clazz.classname, "apps");

    var databaseProperties =
      {
        /** The owner of the application (id of Visitor object) */
        "owner" : "String",

        /** The application title */
        "title" : "String",

        /** Description of the application */
        "description" : "String",

        /** Image #1 (data URL) */
        "image1" : "String",

        /** Image #2 (data URL) */
        "image2" : "String",

        /** Image #3 (data URL) */
        "image3" : "String",

        /** Authorship chain */
        "previousAuthors" : "String",

        /** Source ZIP file (base64-encoded) */
        "source" : "String",

        /** Executable APK file (base64-encoded) */
        "apk" : "String",

        /** Tags assigned to this application */
        "tags" : "Array",

        /** Time the most recent Source ZIP file was uploaded */
        "uploadTime" : "String",

        /** Number of "likes" of this application */
        "numLikes" : "Number",

        /** Number of downloads of this application */
        "numDownloads" : "Number",

        /** Number of times this application was viewed */
        "numViewed" : "Number",

        /** Number of comments on this application */
        "numComments" : "Number",

        /** Status of this application (active, pending, banned) */
        "status" : "Number"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("apps", 
                                                 databaseProperties);
  }
});
