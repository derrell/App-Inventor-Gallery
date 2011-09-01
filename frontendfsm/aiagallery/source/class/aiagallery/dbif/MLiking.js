/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MLiking",
{
  construct : function()
  {

    this.registerService("likesPlusOne",
                         this.likesPlusOne,
                         [ "appId" ]);
  },

  statics :
  {

  },

  members :
  {
    /**
     *  Add one to the number of times this app has been liked
     * 
     * @param appId {Integer}
     *   This is either a string or number which is the uid of the app which is
     *   being liked.
     * 
     * @return {Integer || Error}
     *   This is the number of times this app has been liked, or an error if
     *   the app was not found 
     * 
     */
    likesPlusOne : function(appId, error)
    {
      var            appObj;
      var            appDataObj;
      
      appObj = new aiagallery.dbif.ObjAppData(appId);
      
      appDataObj = appObj.getData();
      
      if (appObj.getBrandNew())
      {
        error.setCode(1);
        error.setMessage("App with that ID not found. Unable to like.");
        return error;
      }
      
      appDataObj.numLikes++;
      
      appObj.put();

      return appDataObj.numLikes;
    }
  }
});
