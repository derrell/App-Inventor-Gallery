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
      var andQueryResults;
      var queryResult;
      var individualQueryResults = [];
      
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
           
      keywordArr = keywordString.split(" ");

      // Build the complex Criteria object
      criteria = 
        {
          type    : "op",
          method  : "and",
          children : []
        };
        
      // Adding AND criteria for each word, and doing individual word query
      keywordArr.forEach(function(keyword)
        {
      
          criteriaChild = 
            {
              type  : "element",
              field : "word",
              value : keyword
              };
          
          criteria.children.push(criteriaChild);
              
          queryResult = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjSearch",
                                                criteriaChild);
          
          // Collect all the single word queries
          individualQueryResults.concat(queryResult);
          
        });
      
      // Search for all keywords AND'd together
      // That is, only return Apps which have all words.
      andQueryResults = rpcjs.dbif.Entity.query("aiagallery.dbif.ObjSearch", 
                                                criteria);

      // Add the individual results to the end of the list that contains all
      // words
      andQueryResults.concat(individualQueryResults);
      
      // Make sure there are no duplicates
      andQueryResults = qx.lang.Array.unique(andQueryResults);
      
      // Create a UID list to exchange for App Data objects
      andQueryResults.forEach(function(searchObj)
                              {
                                uidArr.push(parseInt(searchObj.appId, 10));
                              });

      // Exchange array of UIDs for array of App Data objects using
      // MApps.getAppListByList() and return that
      return this.getAppListByList(uidArr, requestedFields);
      
    }
  }
});
