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

/*
#asset(qx/icon/${qx.icontheme}/128/places/*)
*/


qx.Class.define("aiagallery.widget.virtual.Gallery",
{
  extend : qx.ui.container.Composite,

  construct : function(data)
  {
    this.base(arguments);
    this.setLayout(new qx.ui.layout.Grow());

    this.itemHeight = 160;
    this.itemWidth = 160;
    this.itemPerLine = 1;

    var bDummyData = false;
    if (bDummyData)
    {
      this.itemCount = 431;
      this.setItems(this._generateItems(this.itemCount));
    }
    else if (data)
    {
      this.itemCount = data.length;
      this.setItems(data);
    }
    else
    {
      this.itemCount = 0;
      this.setItems([]);
    }

    var scroller = this._createScroller();
    scroller.set(
      {
        scrollbarX : "off",
        scrollbarY : "auto"
      });
    scroller.getPane().addListener("resize", this._onPaneResize, this);
    this.add(scroller);

    this.manager = new qx.ui.virtual.selection.CellRectangle(scroller.getPane(),
                                                             this);
    this.manager.set(
      {
        mode: "multi",
        drag: true
      });
    this.manager.attachMouseEvents();
    this.manager.attachKeyEvents(scroller);

    this.__cell = new aiagallery.widget.virtual.Cell();
  },


  properties :
  {
    items :
    {
      check : "Array",
      init  : null
    }
  },


  members :
  {
    getItemData : function(row, column) 
    {
      return this.getItems()[row * this.itemPerLine + column];
    },


    isItemSelectable : function(item) 
    {
      return !! this.getItemData(item.row, item.column);
    },


    styleSelectable : function(item, type, wasAdded)
    {
      if (type !== "selected") 
      {
        return;
      }

      var widgets = this.layer.getChildren();
      for (var i=0; i<widgets.length; i++)
      {
        var widget = widgets[i];
        var cell = widget.getUserData("cell");

        if (item.row !== cell.row || item.column !== cell.column) 
        {
          continue;
        }

        if (wasAdded) 
        {
          this.__cell.updateStates(widget, {selected: 1});
        }
        else
        {
          this.__cell.updateStates(widget, {});
        }
      }
    },


    getCellWidget : function(row, column)
    {
      var itemData = this.getItemData(row, column);
      if (!itemData) 
      {
        return null;
      }

      var cell = {row: row, column: column};
      var states = {};
      if (this.manager.isItemSelected(cell)) 
      {
        states.selected = true;
      }

      var widget = this.__cell.getCellWidget(itemData, states);
      widget.setUserData("cell", cell);

      return widget;
    },


    poolCellWidget : function(widget) 
    {
      this.__cell.pool(widget);
    },


    _createScroller : function()
    {
      var scroller = new qx.ui.virtual.core.Scroller(1,
                                                     this.itemPerLine,
                                                     this.itemHeight,
                                                     this.itemWidth);
      this.layer = new qx.ui.virtual.layer.WidgetCell(this);
      scroller.getPane().addLayer(this.layer);

      // Creates the prefetch behavior
      var prefetch = new qx.ui.virtual.behavior.Prefetch(
        scroller,
        {
          minLeft : 0,
          maxLeft : 0,
          minRight : 0,
          maxRight : 0,
          minAbove : 200,
          maxAbove : 300,
          minBelow : 600,
          maxBelow : 800
        });
      prefetch.set(
        {
          interval: 500
        });

      return scroller;
    },


    _onPaneResize : function(e)
    {
      var pane = e.getTarget();
      var width = e.getData().width;

      var colCount = Math.floor(width/this.itemWidth);
      if (colCount == this.itemPerLine) 
      {
        return;
      }
      this.itemPerLine = colCount;
      var rowCount = Math.ceil(this.itemCount/colCount);

      pane.getColumnConfig().setItemCount(colCount);
      pane.getRowConfig().setItemCount(rowCount);
    },


    _generateItems : function(count)
    {
      var items = [];
      var iconImages = 
        [
          "folder.png",
          "user-trash.png",
          "network-server.png",
          "network-workgroup.png",
          "user-desktop.png"
        ];

      var aliasManager = qx.util.AliasManager.getInstance();
      var resourceManager = qx.util.ResourceManager.getInstance();

      for (var i=0; i<count; i++)
      {
        var image =
          "icon/128/places/" +
          iconImages[Math.floor(Math.random() * iconImages.length)];

        items[i] = 
          {
            label : "Icon #" + (i+1),
            icon  : image
          };
      }

      return items;
    }
  },
  
  destruct : function()
  {
    this._disposeObjects("__cell", "layer");
  }
});
