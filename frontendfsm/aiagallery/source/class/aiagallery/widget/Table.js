/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.widget.Table",
{
  extend : qx.ui.table.Table,

  construct : function(tableModel, custom)
  {
    this.base(arguments, tableModel, custom);
    
    // Arrange to be have the cellEditorOpening event fired when a modal cell
    // editor opens.
    this.setModalCellEditorPreOpenFunction(
      function(cellEditor, cellInfo)
      {
        this.fireDataEvent("cellEditorOpening",
                           {
                             cellEditor : cellEditor,
                             cellInfo   : cellInfo
                           });
      });
  },

  events : 
  {
    /**
     * Dispatched when a cell editor is opening. The data is a map containing
     * the cellEditor object and the cellInfo map.
     */
    "cellEditorOpening" : "qx.event.type.Data"
  }
});
