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
    Status      : 
    {
      Banned  : 0,
      Pending : 1,
      Active  : 2
    },
    
    Permissions :
    {
      // Start: from MApps
      "addOrEditApp" : "Add and edit applications",
      "deleteApp"    : "Delete applications",
      "getAppList"   : "Get application list",
      "appQuery"     : "Query for applications",
      "getAppInfo"   : "Get application detail information",
      // End MApps
      
      // Start MComments
      "addComment"   : "Add comments to an application",
      "deleteComment": "Delete comments from an application",
      "getComments"  : "Retrieve comments about an application",
      // End MComments
      
      // Start MTags
      "getCategoryTags" : "Get the list of category tags"
      // End MTags
    }
  }
});
