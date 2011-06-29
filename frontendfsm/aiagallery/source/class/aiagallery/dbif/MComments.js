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
    this.registerService("deleteComment",    this.deleteComment);
    this.registerService("getComments", this.getComments);
  },

  statics :
  {
    _base160arr : 
    [48 , 49 , 50 , 51 , 52 , 53 , 54 , 55 , 56 , 57 , /* 0-9 */
    58 , 59 , 65 , 66 , 67 , 68 , 69 , 70 , 71 , 72 , /* : ; A-H */
    73 , 74 , 75 , 76 , 77 , 78 , 79 , 80 , 81 , 82 , /* I-R */
    83 , 84 , 85 , 86 , 87 , 88 , 89 , 90 , 97 , 98 , /* S-Z , a-b */
    99 , 100, 101, 102, 103, 104, 105, 106, 107, 108, /* c-l */
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
    246, 247, 248, 249, 250, 251, 252, 253, 254, 255] /* latin1 */
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
      var             parentObj;
      var             parentTreeId;
      var             myTreeId;
      var             parentList;
      var             parentNumChildren;
        
        
      // Determine who the logged-in user is
      whoami = this.getWhoAmI();

      // Get a new ObjComments object.
      commentObj = new aiagallery.dbif.ObjComments();
      
      // Set up all the data we can at the moment (everything but treeId)
      commentObj.setData(
        {
          "visitor"     : whoami,
          "text"        : text,
          "app"         : appId,
          "numChildren" : 0
        });
      
      // Was a parent comment's UID provided?
      // Regardless, we need to have parentNumChildren and parentTreeId filled
      //   by the end of this if-else block. Where ever we got the numChildren
      //   from also needs to be incremented and updated.
      if (!parentUID)
      {
        // No, we're going to have to use the default parent id "0000"
        parentTreeId = "";
        
        // Need to get and increment the App's numRootComments
        parentObj = new aiagallery.dbif.ObjAppData(appId);
        
        // Get what we need
        parentNumChildren = parentObj.getData().numRootComments || 0;
        
        // Increment and update
        parentObj.setData({"numRootComments" : parentNumChildren + 1});
        parentObj.put();
        
      }
      else
      {
        // Yes, use it to get the parent object.
        parentObj = new aiagallery.dbif.ObjComments(parentUID);
        
        // Was our parentUID invalid, resulting in a new ObjComments?
        if (parentObj.getBrandNew())
        {
          // We can't use an invalid UID as our parent UID!
          error.setCode(1);
          error.setMessage("Unrecognized parent UID");
          return error;
        }
        
        // Get what we came for.
        parentNumChildren = parentObj.getData().numChildren;
        parentTreeId = parentObj.getData().treeId;
        
        // Increment # of children and update. Congrats! a new baby comment!
        parentObj.setData({"numChildren" : parentNumChildren + 1});
        parentObj.put();
        
      }
      
      // Append our parent's number of children, base160 encoded, to parent's
      //   treeId
      myTreeId = parentTreeId + this._numTobase160(parentNumChildren);
      
      // Complete the comment record by giving it a treeId
      commentObj.setData({"treeId" : myTreeId});
      
      // Save this in the database
      commentObj.put();
      
      // This includes newly-created key (if adding)
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
    deleteComment : function(uid, error)
    {
      var             commentObj;

      // Retrieve an instance of this comment entity
      commentObj = new aiagallery.dbif.ObjComments(uid);
      
      // Does this application exist?
      if (commentObj.getBrandNew())
      {
        // It doesn't. Let 'em know.
        return false;
      }

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
      if (typeof(offset) != "undefined" && offset !== null)
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
     * @param {Number}
     *   An integer to base160 encode
     * 
     * @return {String}
     *   A string of length 4 containing base160 digits as characters.
     */
    _numTobase160 : function(val)
    {
      var retStr = "";
      
      for (var i = 3; i >= 0 ; i--)
      {
        // Take the number mod 160. Prepend the ASCII char of the result.
        retStr = String.fromCharCode(this.base160arr[val % 160]) + retStr;
        val = Math.floor(val / 160);
      }
      
      return retStr;
    },
    /**
     * Increment the base160 number passed. This only augments the farthest
     * right 4 characters. Any characters at index 0 through 
     * base160str.length - 5 are untouched.
     * 
     * @param base160str {String}
     *   An integer encoded as a string of base160 characters.
     * 
     * @return {String}
     *   An integer encoded as a string of base160 characters. This is the 
     *   argument + 1.
     */
    _incrementbase160 : function(base160str)
    {
      var len = base160str.length;
      var i;
      var notMyPiece = base160str.substr(0, len-4);
      var retStr = "";
      var charCode;
      
      // We only care about the rightmost 4 digits
      for (i = len-1; i >= len-4 ; i--)
      {
         // What is the ascii value?
         charCode = base160str.charCodeAt(i);
         
         // Is this the last entry in the encoding array?
         if (charCode == this._base160arr[base160str.len-1] )
         {
           // Then this is a carry. This value gets base160arr[0]. We go on to
           // the next higher-order digit by continuing through the for-loop
           retStr = this._base160arr[0] + retStr;
         }
         else
         {
           // No carry. Just add 1, piece everything together, and we're done.
           retStr = String.fromCharCode(charCode + 1) + retStr;
          
           retStr = notMyPiece + base160str.substring(len-4, i) + retStr;
           return retStr;
         }
      }
     
      return retStr;
    }
  }
});
