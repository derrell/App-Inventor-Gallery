/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 * 
 * This code is derived from qooxdoo demobrowser code which contains the
 * following copyright and authorship:
 *
 *   Copyright:
 *     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
 *   Authors:
 *     Fabian Jakobs (fjakobs)
 */

qx.Class.define("aiagallery.widget.virtual.Cell",
{
  extend : qx.ui.virtual.cell.AbstractWidget,

  members :
  {
    _createWidget : function()
    {
      var widget = new qx.ui.basic.Atom().set(
        {
          iconPosition: "top"
        });
      
      widget.getChildControl("label").set(
        {
          padding : [0, 4]
        });
      
      widget.getChildControl("icon").set(
        {
          padding : 4
        });
      
      return widget;
    },


    updateData : function(widget, data)
    {
      widget.set(
        {
          icon  : data.icon,
          label : data.label
        });
    },


    updateStates : function(widget, states)
    {
      var label = widget.getChildControl("label");
      var icon = widget.getChildControl("icon");

      if (states.selected)
      {
        label.setDecorator("selected");
        label.setTextColor("text-selected");
        icon.setDecorator("group");
      }
      else
      {
        label.resetDecorator();
        label.resetTextColor();
        icon.resetDecorator();
      }
    }
  }
});
