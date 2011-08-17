/**
 * Copyright (c) 2011 Reed Spool
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MSearch",
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
     * words in the keyword string. The first results will be Apps that contain
     * all words from the keyword string if there are any. Following that are
     * all the results which contain one or many but not all of the words. There
     * are no more restrictions on order.
     */
    keywordSearch : function(keywordString, queryFields, requestedFields, error)
    {
      var keywordArr;
      var criteria;
      var criteriaChild;
      var searchResults;
      var uidArr = [];
      var queryResultsMap = {};
      var queryResult;
      var allWordResults = [];
      var otherResults = [];
      var curUID;
      
      // Make sure there is at least 1 keyword given
      if (keywordString === null || typeof keywordString === "undefined" ||
          keywordString === "")
      {
        error.setCode(3);
        error.setMessage("At least 1 keyword required for keyword search");
        return error;
      }

      // Make sure all keyword searches are doing lowercase. ObjSearch stores
      // all entries in lowercase
      keywordString = keywordString.toLowerCase();
           
      // The keyword string is space delimited, let's tokenize
      keywordArr = keywordString.split(" ");
        
      // Doing individual word queries
      keywordArr.forEach(function(keyword)
        {
      
          criteria = 
            {
              type  : "element",
              field : "word",
              value : keyword
            };
          
          queryResult = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjSearch",
                                                criteria,
                                                null);
          
          // Collect all the single word queries in a map
          queryResult.forEach(function(obj)
                              {
                                if (typeof queryResultsMap[obj.appId] === "undefined")
                                {
                                  // First we create an array
                                  queryResultsMap[obj.appId] = [];
                                }
                                // Push this keyword into the array
                                queryResultsMap[obj.appId].push(keyword);
                              });
        });
      
      // All Apps which contained all keywords in the keyword string should come first
      for (var curUID in queryResultsMap)
      {
        // So seperate those with all keywords and those without
        if (queryResultsMap[curUID].length === keywordArr.length)
        {
          allWordResults.push(parseInt(curUID, 10));
        }
        else
        {
          otherResults.push(parseInt(curUID, 10));
        }
      }
      
      // And place them in the proper order
      uidArr = allWordResults.concat(otherResults);
        
      // Finally, exchange array of UIDs for array of App Data objects using
      // MApps.getAppListByList() and return that
      return this.getAppListByList(uidArr, requestedFields);
      
    }
  }
});
