/**
 * Copyright (c) 2011 Derrell Lipman
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
    base160arr : 
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
      var             parent;
      var             myTreeId;
      var             parentList;
      var             parentNumChildren;
      var             allowableFields =
        [
          "app",
          "treeId",
          "visitor",
          "timestamp",
          "numChildren",
          "text"
        ];
      var             requiredFields =
        [
          "app",
          "treeId",
          "visitor",
          "timestamp",
          "numChildren",
          "text"
        ];
        
        
      // Determine who the logged-in user is
      whoami = this.getUserData("whoami");

      // Get a new ObjComments object.
      commentObj = new aiagallery.dbif.ObjComments();
      
      // Set up all the data we can at the moment (everything but treeId)
      commentObj.setData({
        "visitor"     : whoami,
        "timestamp"   : String((new Date()).getTime()),
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
        parentTreeId = "0000";
        
        // Need to get and increment the App's numRootComments
        parentObj = new aiagallery.dbif.ObjAppData(appId);
        
        // Get what we need
        parentNumChildren = parentObj.getData().numRootComments;
        
        // Increment and update
        parentObj.setData({
          "numRootComments" : parentNumChildren + 1
        });
        parentObj.push();
        
        //Done
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
        parentObj.setData({
          "numChildren" : parentNumChildren + 1
        });
        parentObj.push();
        
      }appObj.put();
      
      // Append our parent's number of children, base160 encoded, to parent's
      //   treeId
      myTreeId = parentTreeId + this.numTobase160(parentNumChildren);
      
      // Complete the comment record by giving it a treeId
      commentObj.setData({
        "treeId" : myTreeId
      });
      
      // Save this in the database
      commentObj.put();
      
      // This includes newly-created key (if adding)
      return commentObj.getData();  
    },
    
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
     * Get a portion of the application list.
     *
     * @param bStringize {Boolean}
     *   Whether the tags, previousAuthors, and status values should be
     *   reformed into a string representation rather than being returned in
     *   their native representation.
     *
     * @param bAll {Boolean}
     *   Whether to return all applications (if permissions allow it) rather
     *   than only those applications owned by the logged-in user.
     *
     * @param sortCriteria {Array}
     *   An array of maps. Each map contains a single key and value, with the
     *   key being a field name on which to sort, and the value being one of
     *   the two strings, "asc" to request an ascending sort on that field, or
     *   "desc" to request a descending sort on that field. The order of maps
     *   in the array determines the priority of that field in the sort. The
     *   first map in the array indicates the primary sort key; the second map
     *   in the array indicates the next-highest-priority sort key, etc.
     *
     * @param offset {Integer}
     *   An integer value >= 0 indicating the number of records to skip, in
     *   the specified sort order, prior to the first one returned in the
     *   result set.
     *
     * @param limit {Integer}
     *   An integer value > 0 indicating the maximum number of records to return
     *   in the result set.
     */
    getComments : function(bStringize, bAll, sortCriteria, offset, limit)
    {
      var             categories;
      var             categoryNames;
      var             appList;
      var             whoami;
      var             criteria;
      var             resultCriteria = [];
      var             owners;
  
      // Get the current user
      whoami = this.getUserData("whoami");

      // Create the criteria for a search of apps of the current user
      if (! bAll)
      {
        criteria =
          {
            type  : "element",
            field : "owner",
            value : whoami
          };
      }
      else
      {
        // We want all objects
        criteria = null;
      }
      
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
      
      // If sort criteria are given...
      if (typeof(sortCriteria) !== "undefined" && sortCriteria !== null)
      {
        // ... then add them too.
        resultCriteria.push({ type : "sort", value : sortCriteria });
      }

      // Issue a query for all apps 
      appList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", 
                                        criteria,
                                        resultCriteria);

      // If we were asked to stringize the values...
      if (bStringize)
      {
        // ... then for each app that matched the criteria...
        appList.forEach(
          function(app)
          {
            [
              "tags",
              "previousAuthors"
            ].forEach(function(field)
              {
                // ... stringize this field.
                app[field] = app[field].join(", ");
              });

            // Convert from numeric to string status
            app.status = [ "Banned", "Pending", "Active" ][app.status];

            // Replace the owner name with the owner's display name
            owners = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                            app["owner"]);

            // Replace his visitor id with his display name
            app["owner"] = owners[0].displayName;
          });
      }
      
      // Create the criteria for a search of tags of type "category"
      criteria =
        {
          type  : "element",
          field : "type",
          value : "category"
        };
      
      // Issue a query for category tags
      categories = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                           criteria,
                                           [
                                             { 
                                               type  : "sort",
                                               field : "value",
                                               order : "asc"
                                             }
                                           ]);
      
      // They want only the tag value to be returned
      categoryNames = categories.map(function() { return arguments[0].value; });

      // We've built the whole list. Return it.
      return { apps : appList, categories : categoryNames };
    },
    
    /**
     * Issue a query for a set of applicaitons. Limit the response to
     * particular fields.
     *
     * @param criteria {Map|Key}
     *   Criteria for selection of which applications to return. This
     *   parameter is in the format described in the 'searchCriteria'
     *   parameter of rpcjs.dbif.Entity.query().
     *
     * @param requestedFields {Map?}
     *   If provided, this is a map containing, as the member names, the
     *   fields which should be returned in the results. The value of each
     *   entry in the map indicates what to name that field, in the
     *   result. (This produces a mapping of the field names.) An example is
     *   requestedFields map might look like this:
     *
     *     {
     *       uid    : "uid",
     *       title  : "label", // remap the title field to be called "label"
     *       image1 : "icon",  // remap the image1 field to be called "icon"
     *       tags   : "tags"
     *     }
     *
     *         return { apps : appList, categories : categoryNames };
     * @return {Map}
     *   The return value is a map with two members: "apps" and
     *   "categories". The former is an array of maps, each providing
     *   information about one application. The latter is an array of the tags
     *   which are identified as top-level categories.
     */
    appQuery : function(criteria, requestedFields)
    {
      var             appList;
      var             categories;
      var             categoryNames;
      var             owners;

      appList = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjAppData", criteria);

      // Remove those members which are not requested, and rename as requested
      appList.forEach(
        function(app)
        {
          var requested;

          for (var field in app)
          {
            requested = requestedFields[field];
            if (! requested)
            {
              delete app[field];
            }
            else
            {
              // If the owner is being requested...
              if (field === "owner")
              {
                // ... then issue a query for this visitor
                owners = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjVisitors",
                                                 app[field]);

                // Replace his visitor id with his display name
                app[field] = owners[0].displayName;
              }

              // If the field name is to be remapped...
              if (requested != field)
              {
                // then copy and delete to effect the remapping.
                app[requested] = app[field];
                delete app[field];
              }
            }
          }
        });

      // Create the criteria for a search of tags of type "category"
      criteria =
        {
          type  : "element",
          field : "type",
          value : "category"
        };
      
      // Issue a query for all categories
      categories = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                           criteria,
                                           [
                                             { 
                                               type  : "sort",
                                               field : "value",
                                               order : "asc"
                                             }
                                           ]);
      
      // Tag objects contain the tag value, type, and count of uses. For this
      // procedure, we want to return only the tag value.
      categoryNames = categories.map(function() 
                                     { 
                                       return arguments[0].value;
                                     });

      return { apps : appList, categories : categoryNames };
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
    numTobase160 : function(val)
    {
      var retStr = "";
      
      for (var i = 3; i >= 0 ; i--)
      {
        // Take the number mod 160. Prepend the ASCII char of the result.
        retStr = String.fromCharCode(this.base160arr[val % 160]) + retStr;
        val /= 160 ;
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
    incrementbase160 : function(base160str)
    {
      var len = base160str.length;
      var i;
      var notMyPiece = base160str.substr(0, len-4);
      var retStr = "";
      var char;
      
      // We only care about the rightmost 4 digits
      for (i = len-1; i >= len-4 ; i--)
      {
         // What is the ascii value?
         charCode = base160str.charCodeAt(i)
         
         // Is this the last entry in the encoding array?
         if (charCode == this.base160arr[base160.len-1] )
         {
           // Then this is a carry. This value gets base160arr[0]. We go on to
           // the next higher-order digit by continuing through the for-loop
           retStr = this.base160arr[0] + retStr;
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
