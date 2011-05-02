/**
 * Copyright (c) 2011 Derrell Lipman and Helen Tompkins
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.gallery.home.LinkBox",
{
  extend : qx.ui.basic.Atom,

  construct : function(labelText, imagePath)
  {
    this.base(arguments, this.tr(labelText), imagePath);
    
    this.set(
      {
        rich         : true,
        width        : 250,
        gap          : 20,
        center       : true,
        iconPosition : "right"
      });
  }
});