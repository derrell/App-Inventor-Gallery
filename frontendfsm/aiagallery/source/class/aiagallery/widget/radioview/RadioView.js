/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.radioview.RadioView",
{
  extend : qx.ui.tabview.TabView,

  properties :
  {
    appearance :
    {
      refine : true,
      init   : "radioview"
    },

    rowCount :
    {
      init : 2
    }
  },

  members :
  {
    __nextRow : 0,
    __nextCol : 0,

    // overridden
    _createChildControlImpl : function(id)
    {
      var             control;
      var             buttonBar;

      switch(id)
      {
      case "bar":
        // Create a box to contain the radio button selection items (in a grid)
        // and, right justified, an optional button bar.
        var box = new qx.ui.container.Composite(new qx.ui.layout.HBox());

        // The radio button selections are layed out in a grid
        control = new qx.ui.container.Composite(new qx.ui.layout.Grid(20, 4));
        control.setZIndex(10);

        // We need to prevent the default bar's setOrientation method from
        // being called.
        control.setOrientation = function() { };

        // Force our local function to be called so we can control where in
        // the grid the new menu item is placed
        var _this = this;
        control.add = function(o)
        {
          control._add(o, { row : _this.__nextRow, column : _this.__nextCol });
          ++_this.__nextRow;
          if (_this.__nextRow == _this.getRowCount())
          {
            _this.__nextRow = 0;
            ++_this.__nextCol;
          }
        };

        control.addAt = function(o, index)
        {
          control._addAt(o, 
                       index,
                       { row : _this.__nextRow, column : _this.__nextCol });
          ++_this.__nextRow;
          if (_this.__nextRow == _this.getRowCount())
          {
            _this.__nextRow = 0;
            ++_this.__nextCol;
          }
        };

        // Add the grid to the box
        box.add(control, { flex : 1 });

        // We'll vertifcally center the buttons (or whatever) in the button bar
        var vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        box.add(vBox);

        // Add a spacer for top clearance
        vBox.add(new qx.ui.core.Spacer(0, 1), { flex : 1 });
        
        // This is the actual, currently empty, button bar
        buttonBar = new qx.ui.container.Composite(new qx.ui.layout.HBox());
        buttonBar.setHeight(20);
        vBox.add(buttonBar);

        // Create a function to retrieve the button bar container, so users
        // of the radio view can optionally add controls to it.
        control.getButtonBar = function()
        {
          return buttonBar;
        };

        // Add a spacer for bottom clearance
        vBox.add(new qx.ui.core.Spacer(0, 1), { flex : 1 });
        
        // Finally, add the box to the radio view.
        this._add(box);
        break;

      case "pane":
        control = this.base(arguments, id);

        // We typically want the pane to dynamically resize based on selection
        control.setDynamic(true);
      }

      return control || this.base(arguments, id);
    }
  }
});
