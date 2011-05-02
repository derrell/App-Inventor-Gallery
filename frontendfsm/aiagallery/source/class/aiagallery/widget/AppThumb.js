/**
 * Copyright (c) 2011 Derrell Lipman and Helen Tompkins
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.AppThumb",
{
  extend : qx.ui.container.Composite,

  construct : function(titleText, ownerText, imagePath)
  {
    // create the layout
    var layout = new qx.ui.layout.VBox();
    
    this.base(arguments, layout);
    
    this.set(
      {
        backgroundColor : "#eee9e9",
        marginRight     : 20,
        padding         : 10,
        width           : 100
      });

    var image = new qx.ui.basic.Image(imagePath);
    image.setWidth(100);
    this.add(image);
    this.add(new qx.ui.basic.Label(titleText));
    this.add(new qx.ui.basic.Label(this.tr("by %1", ownerText)));
  }
});
