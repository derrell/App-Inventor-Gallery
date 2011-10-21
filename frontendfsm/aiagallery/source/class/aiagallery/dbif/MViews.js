/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Paul Geromini 
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MViews",

  construct : function()
  {

    this.registerService("viewsPlusOne",
                         this.viewsPlusOne,
                         [ "appId" ]);
  },

  statics :
  {

  },

  members :
  {
    /**
     *  Add one to the number of times this app has been viewed
     * 
     * @param appId {Integer}
     *   This is either a string or number which is the uid of the app which is
     *   being viewed.
     * 
     * @return {Integer || Error}
     *   This is the number of times this app has been viewed, or an error if
     *   the app was not found 
     * 
     */
    likesPlusOne : function(appId, error)
    {
      var            appObj;
      var            objLikes; 
      
      appObj = new aiagallery.dbif.ObjAppData(appId);      
      appDataObj = appObj.getData();
      
      if (appObj.getBrandNew())
      {
        error.setCode(1);
        error.setMessage("App with that ID not found. Unable to view.");
        return error;
      }

      //Increment the number of views.
      appDataObj.numViewed++;

      //Return the number of views.
      return appDataObj.numViewed; 
    }
  }
});
