/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.dbif.Constants",
{
  extend  : qx.core.Object,

  statics :
  {
    /** 
     *  Value of the maximum amount of times an app or comment 
     *  can be flagged 
     */
    MAX_FLAGGED           : 5,

    /** Number of "newest" apps to return by the getHomeRibbonData() RPC */
    RIBBON_NUM_NEWEST     : 20,
    
    /** Number of "most liked" apps to return by the getHomeRibbonData() RPC */
    RIBBON_NUM_MOST_LIKED : 20,
    

    /** Mapping of status names to values */
    Status      : 
    {
      Banned  : 0,
      Pending : 1,
      Active  : 2
      Deleted : 3
    },
    
    /** Reverse mapping of status: values to names */
    StatusToName :
    [
      "Banned", 
      "Pending",
      "Active",
      "Deleted"
    ],

    /** Mapping of FlagType names to values */
    FlagType      : 
    {
      App  : 0,
      Comment : 1
    },

    /** Reverse mapping of FlagType values to names */
    FlagTypeToName :
    [
      "App", 
      "Comment"
    ],

    /** Mapping of permission names to descriptions */
    Permissions :
    {
      //
      // MApps
      //
      "addOrEditApp"  : "Add and edit applications",
      "deleteApp"     : "Delete applications",
      "getAppListAll" : "Get all users application list",

      /* Anonymous access...
      "getAppList"    : "Get logged in user application list",
      "appQuery"      : "Query for applications",
      "getAppInfo"    : "Get application detail information",
      "intersectKeywordAndQuery" : "Get intersection of keyword search and" +
                                   "appQuery"
      ... */
      
      //
      // MComments
      //
      "addComment"   : "Add comments to an application",
      "deleteComment": "Delete comments from an application",
      
      /* Anonymous access...
      "getComments"  : "Retrieve comments about an application",
      ... */
      
      //
      // MMobile
      //
      /* Anonymous access...
      "mobileRequest" : "Mobile client requests",
      ... */

      //
      // MTags
      //
      /* Anonymous access...
      "getCategoryTags" : "Get the list of category tags",
      ... */
      
      //
      // MVisitors
      //
      "addOrEditVisitor" : "Add and edit visitors",
      "deleteVisitor"    : "Delete visitors",
      "getVisitorList"   : "Retrieve list of visitors",
      
      //
      // MWhoAmI
      //
      /* Anonymous access...
      "whoAmI" : "Identify the current user id and permissions"
       */

      //
      // MLikes
      //
      "likesPlusOne"     : "Like an app"
    }
  }
});
