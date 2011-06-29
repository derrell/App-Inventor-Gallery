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
      "addOrEditApp" : ,
      "deleteApp"    : ,
      "getAppList"   : ,
      "appQuery"     : ,
      "getAppInfo"   : ,
      // End MApps
      
      // Start MComments
      "addComment"   : ,
      "deleteComment": ,
      "getComments"  : ,
      // End MComments
      
      // Start MTags
      "getCategoryTags" : ,
      // End MTags
      
      
    }
  }
});
