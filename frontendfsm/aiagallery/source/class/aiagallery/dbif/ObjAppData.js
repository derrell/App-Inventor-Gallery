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
        "tags"            : [],
        "numLikes"        : 0,
        "numDownloads"    : 0,
        "numViewed"       : 0,
        "numComments"     : 0,
        "creationTime"    : (new Date()).toString(),
        "numRootComments" : 0,
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
        "image1" : "LongString",

        /** Image #2 (data URL) */
        "image2" : "LongString",

        /** Image #3 (data URL) */
        "image3" : "LongString",

        /** Authorship chain */
        "previousAuthors" : "StringArray",

        /** Source ZIP file (base64-encoded) */
        "source" : "LongString",

<<<<<<< HEAD
        /** Executable APK file (base64-encoded) */
        "apk" : "LongString",
=======
        /** File Name of Source File */
        "sourceFileName" : "String",

        /** Blob ids of executable APK file (base64-encoded), newest first */
        "apk" : "StringArray",
>>>>>>> 018884d... Issue #114 Complete

        /** File Name of APK File */
        "apkFileName" : "String",

        /** Tags assigned to this application */
        "tags" : "StringArray",

        /** Time the most recent Source ZIP file was uploaded */
        "uploadTime" : "String",
        
        /** The date and time this App was first created */
        "creationTime" : "String",

        /** Number of "likes" of this application */
        "numLikes" : "Integer",

        /** Number of downloads of this application */
        "numDownloads" : "Integer",

        /** Number of times this application was viewed */
        "numViewed" : "Integer",

        /** Number of root comments on this application */
        "numRootComments" : "Integer",
        
        /** Total number of comments on this application */
        "numComments" : "Integer",

        /** Status of this application (active, pending, banned) */
        "status" : "Integer"
      };

    // Register our property types
    aiagallery.dbif.Entity.registerPropertyTypes("apps", databaseProperties);
  }
});
