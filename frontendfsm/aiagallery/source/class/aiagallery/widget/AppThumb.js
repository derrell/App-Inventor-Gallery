/**
 * Copyright (c) 2011 Derrell Lipman and Helen Tompkins
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.AppThumb",
{
  extend : qx.ui.basic.Atom,

  construct : function(titleText, ownerText, imagePath)
  { 
    this.base(arguments, this.tr("<b>%1</b><br>by %2", titleText, ownerText), imagePath);
      
    this.set(
      {
        rich            : true,
        backgroundColor : "#eee9e9",
        marginRight     : 20,
        padding         : 10,
        gap             : 10,
        width           : 150,
        iconPosition    : "top"
      });

    this.getChildControl("icon").set(
      {
        height : 100,
        width  : 100,
        scale  : true
      });
  }
});
