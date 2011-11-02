/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.Button",
{
  extend : qx.ui.form.Button,
    
    properties : 
    {
      apperance :
      {
        refine : true,
	  init : "likeIt/flagIt-button"
      }
    }
});

