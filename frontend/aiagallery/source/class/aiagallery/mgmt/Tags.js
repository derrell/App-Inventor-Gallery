/**
 * Tag Management
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#asset(aiagallery/*)
*/

qx.Class.define("aiagallery.mgmt.Tags",
{
  extend : qx.ui.tabview.Page,
  
  construct : function(app)
  {
    // Call the superclass constructor
    this.base(arguments, this.tr("Tags"));
  }
});
