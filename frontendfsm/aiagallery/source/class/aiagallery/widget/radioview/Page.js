/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.radioview.Page",
{
  extend : qx.ui.tabview.Page,

  properties :
  {
    appearance :
    {
      refine : true,
      init   : "radioview-page"
    }
  }
});
