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
    /** Mapping of status names to values */
    Status      : 
    {
      Banned  : 0,
      Pending : 1,
      Active  : 2
    },
    
    /** Reverse mapping of status: values to names */
    StatusToName :
    [
      "Banned", 
      "Pending",
      "Active"
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
      "getVisitorList"   : "Retrieve list of visitors"
    }
  }
});
