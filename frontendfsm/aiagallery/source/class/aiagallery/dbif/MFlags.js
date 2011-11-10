/**
 * Copyright (c) 2011 Chris Adler
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

  members :
  {
    /**
     *  Add one to the number of times this app has been liked
     * 
     * @param flagType{Integer}
     *   This is the value of the type of flag that got submitted
     *   (App  : 0, Comment  : 1 )
     *   
     * @param explanationInput{String}
     *   This is the string the user will input as the reason the app or comment
     *   is being flagged.
     * 
     * @param appId {Integer}
     *   This is either a string or number which is the uid of the app which is
     *   being liked.
     * 
     * @param commentId{String}
     *   This is the string that is the treeId of the comment. If an app was 
     *   flagged input a null
     * 
     * @return {Integer || Status}
     *   This is the value of the status of the application 
     *   (Banned  : 0, Pending : 1, Active  : 2)
     * 
     */
    flagIt : function(flagType, explanationInput, appId, commentId, error)
    {
      var            appObj;
      var            appDataObj;
      var            appNum;
      var            result;
      var            criteria;
      var            newFlag;
      var            Data;
      var            flagsList;


      var            visitorId= this.whoAmI().email;
      var            maxFlags = aiagallery.dbif.Constants.MAX_FLAGGED;
      var            statusVals = aiagallery.dbif.Constants.Status;
      var            flagTypeVal = aiagallery.dbif.Constants.FlagType;

      // Check what type of element has been flagged.
      switch (flagType)
      {
        // If an app was flagged:
        case flagTypeVal.App:

          // store the applications data
          appObj = new aiagallery.dbif.ObjAppData(appId);
          appDataObj = appObj.getData();
          appNum = appDataObj.uid;

          // check to ensure an already existing app was found 
          if (appObj.getBrandNew())
          {
            // If not return an error
            error.setCode(1);
            error.setMessage(
              "Application with that ID not found. Unable to flag.");
            return error;
          }

          // Construct query criteria for "flags of this app by current visitor"
          criteria = 
            {
              type : "op",
              method : "and",
              children : 
              [
                {
                  type: "element",
                  field: "app",
                  value: appId
                },
                {
                  type: "element",
                  field: "visitor",
                  value: visitorId
                }
              ]
            };
          // Query for the likes of this app by the current visitor
          // (an array, which should have length zero or one).
          flagsList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjFlags",
                                          criteria,
                                          null);

          // Only change things if the visitor hasn't already flagged this app
          if (flagsList.length === 0)
          {

            // initialize the new flag to be put on the database
            newFlag = new aiagallery.dbif.ObjFlags();

            // store the new flags data
            var data = 
            {
              type        : flagType,
              app         : appNum,
              comment     : null,
              visitor     : visitorId,
              explanation : explanationInput
            }

	    newFlag.setData(data);

            // increments the apps number of flags
            appDataObj.numCurFlags++;      

            // check if the number of flags is greater than or 
            // equal to the maximum allowed
            if(appDataObj.numCurFlags >= maxFlags)
            {
             // If the app is already pending do not touch the status or 
             // send an email  
              if(appDataObj.status != statusVals.Pending)
              {
                // otherwise set the app to pending and send an email
                appDataObj.status = statusVals.Pending;    

                // placeholder code   
                if (qx.core.Environment.get("qx.debug"))
                {
                  alert("email to be sent");
                }
              }
            }
            // put the apps new data and the new flag on the database
            appObj.put();
            newFlag.put();
          }
          return appDataObj.status;
          
          break;

        // if a comment was flagged
        case flagTypeVal.Comment:

          // store the comments data
          var commentObj = new aiagallery.dbif.ObjComments([appId, commentId]);
          var commentDataObj = commentObj.getData();
          var commentNum = commentDataObj.treeId;

          // check to ensure an already existing comment was found 
          if (commentObj.getBrandNew())
          {
            // if not return an error
            error.setCode(1);
            error.setMessage(
              "Comment not found. Unable to flag.");
            return error;
          }


          // Construct query criteria for 
          //"flags of this comment by current visitor"
          criteria = 
          {
            type : "op",
            method : "and",
            children : 
            [
              {
                type: "element",
                field: "comment",
                value: commentNum
              },
              {
                type: "element",
                field: "visitor",
                value: visitorId
              }
            ]
          };
          // Query for the likes of this app by the current visitor
          // (an array, which should have length zero or one).
          flagsList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjFlags",
                                          criteria,
                                          null);

          // Only change things if the visitor hasn't 
          //already flagged this comment
          if (flagsList.length === 0)
          {

            // initialize the new flag to be put on the database
            newFlag = new aiagallery.dbif.ObjFlags();

            // store the flags data 
            var data = 
            {
              type        : flagType,
              app         : appId,
              comment     : commentNum,
              visitor     : visitorId,
              explanation : explanationInput
            }

            newFlag.setData(data);

            // increment the number of flags on the comment
            commentDataObj.numCurFlags++;      

            // check if the number of flags is greater than or 
            // equal to the maximum allowed
            if(commentDataObj.numCurFlags >= maxFlags)
            {
              // If the comment is already pending do not touch the status or 
              // send an email 
              if(commentDataObj.status != statusVals.Pending)
              {
                // otherwise set the comment to pending and send an email
                commentDataObj.status = statusVals.Pending;    

                // placeholder code   
                if (qx.core.Environment.get("qx.debug"))
                {
                  alert("email to be sent");
                }
              }
            }
            // put the comments new data and the new flag on the database
            commentObj.put();
            newFlag.put();
          }

          return commentDataObj.status;

      default:
      error.setCode(1);
      error.setMessage(
        "unknown flag type.");
      return error;
      } 

      // Error message should be redone
      error.setCode(1);
      error.setMessage(
        "Reached an un-reachable section in the flagIt rpc.");
      return error;
    }
  }
});




