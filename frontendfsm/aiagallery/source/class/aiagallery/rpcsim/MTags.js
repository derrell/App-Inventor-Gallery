/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Mixin.define("aiagallery.rpcsim.MTags",
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

      // Retrieve the list of "category" tags
      categories = [];
      for (var tag in this._db.tags)
      {
        if (this._db.tags[tag].type == "category")
        {
          categories.push(tag);
        }
      }
      
      // We've built the whole list. Return it.
      return categories;
    }
  }
});
