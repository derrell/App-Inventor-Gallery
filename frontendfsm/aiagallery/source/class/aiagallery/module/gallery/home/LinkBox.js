/**
 * Copyright (c) 2011 Derrell Lipman and Helen Tompkins
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.module.gallery.home.LinkBox",
{
  extend : qx.ui.container.Composite,

  construct : function(labelText, imagePath)
  {
    // create the layout
    var layout = new qx.ui.layout.HBox();
    layout.set(
      {
        spacing : 20,
        alignY  : "middle"
      });
      
    this.base(arguments, layout);
    
    // add the description
    var label = new qx.ui.basic.Label();
    label.set(
      {
        value      : labelText,
        rich       : true,
        width      : 200
      });
      
    // add the image
    var image = new qx.ui.basic.Image(imagePath);
    
    this.add(label);
    this.add(image);
  }
});