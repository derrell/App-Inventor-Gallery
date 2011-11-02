/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MFlags",
{
  construct : function()
  {

    this.registerService("flagIt",
                         this.flagIt,
                         [ "flagType", 
                           "explanationInput", 
                           "appId", 
                           "commentId" 
                         ]);
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
    flagIt : function(flagType, explanationInput, appId, commentId, error)
    {
      var            appObj;
      var            appDataObj;
      var            visitorId;
      var            appNum;
      var            result;
      var            criteria;
      var            newFlag;
      var            Data;
      var            maxFlags;
      var            statusVals;
      var            flagTypeVal;

      maxFlags = aiagallery.dbif.Constants.MAX_FLAGGED;
      statusVals = aiagallery.dbif.Constants.Status;
      flagTypeVal = aiagallery.dbif.Constants.FlagType;

      visitorId = this.whoAmI().email;

      switch (flagType)
      {
        case flagTypeVal.App:

          appObj = new aiagallery.dbif.ObjAppData(appId);
          appDataObj = appObj.getData();
          appNum = appDataObj.uid;

          if (appObj.getBrandNew())
          {
            error.setCode(1);
            error.setMessage(
              "Application with that ID not found. Unable to flag.");
            return error;
          }

          newFlag = new aiagallery.dbif.ObjFlags();

          var data = {
            type        : flagType,
            app         : appNum,
            comment     : null,
            visitor     : visitorId,
            explanation : explanationInput
          }

	  newFlag.setData(data);

          appDataObj.numCurFlags++;      

          if(appDataObj.numCurFlags >= maxFlags)
          {
            /**
             * If the app is already pending do not touch the status or 
             * send an email 
             */
            if(appDataObj.status == statusVals.Pending)
              {}else
                {
                  appDataObj.status = statusVals.Pending;    

                  // placeholder code   
                  alert("email to be sent");
                }
          }

          appObj.put();
          newFlag.put();

          return appDataObj.status;

        case flagTypeVal.Comment:

          commentObj = new aiagallery.dbif.ObjComments([appId, commentId]);
          commentDataObj = commentObj.getData();
          commentNum = commentDataObj.treeId;

          if (commentObj.getBrandNew())
          {
            error.setCode(1);
            error.setMessage(
              "Comment not found. Unable to flag.");
            return error;
          }

          newFlag = new aiagallery.dbif.ObjFlags();

          var data = {
            type        : flagType,
            app         : appId,
            comment     : commentNum,
            visitor     : visitorId,
            explanation : explanationInput
          }

	  newFlag.setData(data);

          commentDataObj.numCurFlags++;      


          if(commentDataObj.numCurFlags >= maxFlags)
          {
            /**
             * If the comment is already pending do not touch the status or 
             * send an email 
             */
            if(commentDataObj.status == statusVals.Pending)
              {}else
                {
                  commentDataObj.status = statusVals.Pending;    

                  // placeholder code
                  alert("email to be sent");
                }
          }

          commentObj.put();
          newFlag.put();

          return commentDataObj.status;
          break;
      } 

      // Error message should be redone
      error.setCode(1);
      error.setMessage(
        "Reached an un-reachable point in the flagging rpc.");
      return error;
    }
  }
});




