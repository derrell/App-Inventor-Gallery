/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MVisitors",
{
  construct : function()
  {
    
    this.registerService("keywordSearch",
                         this.editProfile,
                         [ "keywordString",
                           "queryFields",
                           "requestedFields"]);
  
  },
  
  statics :
  {
            
  },
  
  members :
  {
    /**
     * Returns an array of App Info objects, which contain a word or words from
     * the keyword string. 
     * 
     * NOTE: There is no ordering of the returned Apps. This is simply a 
     * keyword query.
     * 
     * @param keywordString {String}
     * A space delimited string of words to query on. A returned App will
     * contain all of the words in the string, in any order.
     * 
     * @param queryFields {Array}
     * An array of strings of App data fields which are to be checked for the
     * keyword(s). The array may contain none or any or all of the following: 
     * 
     * "title"
     * "description"
     * "tags"
     * 
     * @param requestedFields {Map}
     * See MApps.appQuery() documentation
     * 
     * @return {Array}
     * An array of objects containing info about apps which contain the word or
     * words in the keyword string
     */
    keywordSearch : function(keywordString, queryFields, requestedFields, error)
    {
      var keywordArr;
      var criteria;
      var searchResults;
      var uidArr = [];
      
      if (keywordString === null || typeof keywordString === "undefined" ||
          keywordString === "")
      {
        error.setCode(3);
        error.setMessage("At least 1 keyword required for keyword search");
        return error;
      }
      
      keywordArr = keywordString.split(" ");
      
      // If there was more than 1 keyword...
      if (keywordArr.length > 1)
      {
        
        // Build the complex Criteria object
        criteria = 
          {
            type    : "op",
            method  : "and",
            children : []
          };
        
        keywordArr.forEach(function(keyword)
                           {
                             criteria.children.push(
                               {
                                 type : "element",
                                 field: "word",
                                 value: keyword                               
                               });
                           });

      }
      else
      {
        
        // No, just 1, use a simple criteria object
        criteria =
          {
            type   : "element",
            field  : "word",
            value  : keywordArr[0]
          };
        
          
      }
        
      // Use MApps.getAppListByList(uidArr, requestedFields)
      searchResults = rpcjs.dbif.Enttiy.query("aiagallery.dbif.ObjSearch", 
                                              criteria);
      
      searchResults.forEach(function(searchObj)
                            {
                              uidArr.push(parseInt(searchObj.appId, 10));
                            });

      // Exchange array of UIDs for array of App Data objects using
      // MApps.getAppListByList() and return that
      return this.getAppListByList(uidArr, requestedFields);
      
    }
  }
});
