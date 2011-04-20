/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.ScaledImageCellRenderer",
{
  extend : qx.ui.table.cellrenderer.Image,
  
  members :
  {
    // overridden
    _getContentHtml : function(cellInfo)
    {
      var content = "<div></div>";

      // set image
      if (this.__imageData.url) 
      {
        content = qx.bom.element.Decoration.create(
          this.__imageData.url,
          "scale", 
          {
            width: this.__imageData.width + "px",
            height: this.__imageData.height + "px",
            display:
              (qx.core.Environment.get("engine.name") == "gecko" &&
               qx.core.Environment.get("engine.version") < 1.9 
                 ? "-moz-inline-box"
                 : "inline-block"),
            verticalAlign: "top",
            position: "static"
        });
      };

      return content;
    }
  }
});
