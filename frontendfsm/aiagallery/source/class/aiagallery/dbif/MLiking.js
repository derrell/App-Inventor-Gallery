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
      var            likesObj;
      var            likesDataObj;
      var            whoami;
      var            likesResult;
      var            searchCriteria;
      
      appObj = new aiagallery.dbif.ObjAppData(appId);
      
      appDataObj = appObj.getData();

      // Determine who the logged-in user is
      whoami = this.getWhoAmI().email;
      
      if (appObj.getBrandNew())
      {
        error.setCode(1);
        error.setMessage("App with that ID not found. Unable to like.");
        return error;
      }

      searchCriteria =
        {
          type : "op",
          method : "and",
          children : [
            {
              type : "element",
              field : "visitor",
              value : whoami
            },
{
              type : "element",
              field: "app",
              value: appId
            }]
        };     

      //Query to find if the user already liked this app
      likesResult = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjLikes", searchCriteria);

      //If the user has not liked it yet
      if (likesResult.length < 1) {
        //Insert our user and appid into the Likes table
        likesObj = new aiagallery.dbif.ObjLikes();
        likesDataObj = likesObj.getData();
        likesDataObj.visitor = whoami;
        likesDataObj.app = appId;
        likesObj.put();

        //Update our likes
        appDataObj.numLikes++;
        appObj.put();  
      }

      return appDataObj.numLikes; 
    }
  }
});
