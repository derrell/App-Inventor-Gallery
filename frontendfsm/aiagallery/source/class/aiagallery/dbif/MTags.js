/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.dbif.MTags",
{
  construct : function()
  {
    this.registerService("getCategoryTags", this.getCategoryTags);
  },

  members :
  {
    getCategoryTags : function()
    {
      var             categories;
      var             criteria;
      var             results;

      // Create the criteria for a search of tags of type "category"
      criteria =
        {
          type  : "element",
          field : "type",
          value : "category"
        };
      
      // Issue a query for category tags
      categories = aiagallery.dbif.Entity.query("aiagallery.dbif.ObjTags", 
                                                criteria,
                                                [
                                                  { 
                                                    type : "sort",
                                                    value :
                                                    {
                                                      "value" : "asc"
                                                    }
                                                  }
                                                ]);

      // They want only the tag value to be returned
      results = categories.map(function() { return arguments[0].value; });

      // Give 'em what they came for!
      return results;
    }
  }
});
