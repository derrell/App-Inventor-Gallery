/**
 * Copyright (c) 2011 Derrell Lipman
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MComments",
{
  construct : function()
  {
    this.registerService("addComment", this.addComment);
    this.registerService("deleteComment", this.deleteComment);
    this.registerService("getComments", this.getComments);
  },

  statics :
  {
    _base160arr : 
    [
       48,  49,  50,  51,  52,  53,  54,  55,  56,  57,  /* 0-9 */
       58,  59,  65,  66,  67,  68,  69,  70,  71,  72,  /* : ; A-H */
       73,  74,  75,  76,  77,  78,  79,  80,  81,  82,  /* I-R */
       83,  84,  85,  86,  87,  88,  89,  90,  97,  98,  /* S-Z , a-b */
       99, 100, 101, 102, 103, 104, 105, 106, 107, 108, /* c-l */
      109, 110, 111, 112, 113, 114, 115, 116, 117, 118, /* m-v */
      119, 120, 121, 122, 160, 161, 162, 163, 164, 165, /* w-z, latin1 */
      166, 167, 168, 169, 170, 171, 172, 173, 174, 175, /* latin1 */
      176, 177, 178, 179, 180, 181, 182, 183, 184, 185, /* latin1 */
      186, 187, 188, 189, 190, 191, 192, 193, 194, 195, /* latin1 */
      196, 197, 198, 199, 200, 201, 202, 203, 204, 205, /* latin1 */
      206, 207, 208, 209, 210, 211, 212, 213, 214, 215, /* latin1 */
      216, 217, 218, 219, 220, 221, 222, 223, 224, 225, /* latin1 */
      226, 227, 228, 229, 230, 231, 232, 233, 234, 235, /* latin1 */
      236, 237, 238, 239, 240, 241, 242, 243, 244, 245, /* latin1 */
      246, 247, 248, 249, 250, 251, 252, 253, 254, 255  /* latin1 */
    ]
  },

  members :
  {
    /**
     *  Add a comment to the database.
     * 
     * @param appId 
     *   This is either a string or number which is the uid of the app to which
     *   this comment is associated.
     * 
     * @param parentId {String}
     *   The parent's treeId.
     * 
     * @param text {String}
     *   The comment text itself.
     * 
     * 
     */
    addComment : function(appId, text, parentUID, error)
    {
      var             whoami;
      var             commentObj;
      var             commentObjData;
      var             parentAppObj;
      var             parentAppData;
      var             parentCommentObj;
      var             parentCommentData;
      var             parentTreeId;
      var             myTreeId;
      var             parentList;
      var             parentNumChildren;
        
        
      // Determine who the logged-in user is
      whoami = this.getWhoAmI();

      // Get a new ObjComments object.
      commentObj = new aiagallery.dbif.ObjComments();
      
      // Retrieve a data object to manipulate.
      commentObjData = commentObj.getData();
      
      // Set up all the data we can at the moment (everything but treeId)
      commentObjData.visitor     = whoami.userId;
      commentObjData.text        = text;
      commentObjData.app         = appId;
      commentObjData.numChildren = 0;
      
      // Regardless, we need to have parentNumChildren and parentTreeId filled
      //   by the end of this if-else block. Where ever we got the numChildren
      //   from also needs to be incremented and updated.
      
      // Need to get and increment the Parent App's numRootComments
      // and numComments total
      parentAppObj = new aiagallery.dbif.ObjAppData(appId);
      
      parentAppData = parentObj.getData();

      // Was a parent comment's UID provided?
      if (typeof(parentUID) === "undefined" || parentUID === null)
      {
        // No, we're going to have to use the default parent id "0000"
        parentTreeId = "";
        
        // Get what we need
        parentNumChildren = parentObjData.numRootComments || 0;         
        
      }
      else
      {
        // Yes, use it to get the parent comment object.
        parentCommentObj = new aiagallery.dbif.ObjComments(parentUID);
        
        parentCommentData = parentCommentObj.getData();
        
        // Was our parentUID invalid, resulting in a new ObjComments?
        if (parentCommentObj.getBrandNew())
        {
          // We can't use an invalid UID as our parent UID!
          error.setCode(1);
          error.setMessage("Unrecognized parent app UID");
          return error;
        }
        
        // Get what we came for.
        parentNumChildren = parentObjData.numChildren;
        parentTreeId = parentObjData.treeId;
        
        // Increment parent comment's # of children
        parentCommentData.numChildren = parentNumChildren + 1;
        
        // Save the new # children in the parent comment
        parentCommentObj.put();
      }

      // Increment parent app's # of children
      parentAppData.numRootComments = parentNumChildren + 1;

      // Update the parent app and/or comment object. 
      // Congrats! a new baby comment!
      parentAppObj.put();

      // Append our parent's number of children, base160 encoded, to parent's
      //   treeId
      myTreeId = parentTreeId + this._numToBase160(parentNumChildren);
      
      // Complete the comment record by giving it a treeId
      commentObjData.treeId = myTreeId;
      
      // Save this in the database
      commentObj.put();
      
      // This includes newly-created key
      return commentObj.getData();  
    },
    
    /**
     * Delete a specific individual comment
     * 
     * @param uid {?}
     *   This is the unique identifier for the comment which is to be deleted
     * 
     * @return {Boolean}
     *   Returns true if deletion was successful. If false is returned, nothing
     *   was deleted.
     */
    deleteComment : function(treeId, error)
    {
      var             commentObj;
      var             parentAppObj;
      var             parentAppData;
      
      // Retrieve an instance of this comment entity
      commentObj = new aiagallery.dbif.ObjComments(treeId);
      
      // Does this comment exist?
      if (commentObj.getBrandNew())
      {
        // It doesn't. Let 'em know.
        return false;
      }
      
      
      // Find out the App that was commented on and...
      parentAppObj = new aiagallery.dbif.ObjAppData(commentObj["app"]);
      
      parentAppData = parentObj.getData();
      
      // Decrement the number of comments attached to this App.
      parentAppData["numComments"]--;
      
      // Save this change
      parentAppObj.put();
      
      // Delete the app
      commentObj.removeSelf();
      
      // We were successful
      return true;
    },
    
    /**
     * Get comments associated with an App
     *
     * @param appId {?}
     *   The appId whose comments should be returned
     * 
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     * 
     * @return {Array}
     *   An array containing all of the comments related to this app
     *   
     */
    getComments : function(appId, offset, limit)
    {
      var             commentList;
      var             resultCriteria = [];
  

      // If an offset is requested...
      if (typeof(offset) !== "undefined" && offset !== null)
      {
        // ... then specify it in the result criteria.
        resultCriteria.push({ "offset" : offset });
      }
      
      // If a limit is requested...
      if (typeof(limit) !== "undefined" && limit !== null)
      {
        // ... then specify it in the result criteria
        resultCriteria.push({ "limit" : limit });
      }
      
      // Issue a query for all comments, with limit and offset settings applied
      commentList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjComments", 
                                        {
                                          type : "element",
                                          field: "app",
                                          value: appId
                                        },
                                        resultCriteria);

      return commentList;
    },
   
    /**
     * Encode an integer as a string of base160 characters
     * 
     * @param val {Number}
     *   An integer to base160 encode
     * 
     * @return {String}
     *   A string of length 4 containing base160 digits as characters.
     */
    _numToBase160 : function(val)
    {
      var retStr = "";
      
      for (var i = 3; i >= 0 ; i--)
      {
        // Take the number mod 160. Prepend the ASCII char of the result.
        retStr = String.fromCharCode(
          aiagallery.dbif.MComments._base160arr[val % 160]) + retStr;
        val = Math.floor(val / 160);
      }
      
      return retStr;
    },
    /**
     * Increment the base160 number passed. This only augments the farthest
     * right-most 4 characters (base160 digits).
     * 
     * @param base160str {String}
     *   An integer encoded as a string of base160 characters.
     * 
     * @return {String}
     *   An integer encoded as a string of base160 characters. This is the 
     *   argument + 1.
     */
    _incrementBase160 : function(base160str)
    {
      var len = base160str.length;
      var i;
      var notMyPiece = base160str.substr(0, len-4);
      var retStr = "";
      var ch;
      var index;
      
      // We only care about the rightmost 4 digits, one level in the tree.
      for (i = len - 1; i >= len-4 ; i--)
      {
        // Get this digit
        ch = base160str.charCodeAt(i);

        // Find the index of this digit in the encoding array.
        index = aiagallery.dbif.MComments._base160arr.indexOf(ch);
         
        // Is this the last entry in the encoding array?
        if (index === aiagallery.dbif.MComments._base160arr.length - 1)
        {
          // Yup.  This is a carry. This value gets base160arr[0]. We go on to
          // the next higher-order digit by continuing through the for-loop
          retStr = 
            String.fromCharCode(aiagallery.dbif.MComments._base160arr[0]) +
            retStr;
        }
        else
        {
          // No carry. Just add 1, piece everything together, and we're done.
          retStr = 
            String.fromCharCode(
              aiagallery.dbif.MComments._base160arr[index + 1]) +
            retStr;
          retStr = base160str.substring(len - 4, i) + retStr;
          break;
        }
      }
     
      return notMyPiece + retStr;
    }
  }
});
