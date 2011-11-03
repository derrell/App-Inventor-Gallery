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
      var            myEmail;
      var            likesList;
      var            criteria;
      var            likesObj;
      var            likesDataObj;

      appObj = new aiagallery.dbif.ObjAppData(appId);
      appDataObj = appObj.getData();

      myEmail = this.getWhoAmI().email;

      // If there's no such app, return error
      if (appObj.getBrandNew())
      {
        error.setCode(1);
        error.setMessage("App with that ID not found. Unable to like.");
        return error;
      }

      // Construct query criteria for "likes of this app by current visitor"
      criteria = {
        type : "op",
        method : "and",
        children : [
          {
            type: "element",
            field: "app",
            value: appId
          },
          {
            type: "element",
            field: "visitor",
            value: myEmail
      }]};

      // Query for the likes of this app by the current visitor
      // (an array, which should have length zero or one).
      likesList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjLikes",
                                          criteria,
                                          null);

      // Only change things if the visitor hasn't already liked this app
      if (likesList.length === 0)
      {
        // Create a new likes object to prevent future re-likes
        likesObj = new aiagallery.dbif.ObjLikes();
        likesDataObj = likesObj.getData();

        // Put app and visitor info into it
        likesDataObj.app = appId;
        likesDataObj.visitor = myEmail;

        // Write it back to the database
        likesObj.put();

        // And increment the like count in the DB
        appDataObj.numLikes++;
        appObj.put();
      }

      // Return number of likes (which may or may not have changed)
      return appDataObj.numLikes;
    }
  }
});
