/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * This class defines a module descriptor (the registration of a module) and
 * maintains the list of modules that have been registered.
 *
 * A Module object contains the following public properties which may be
 * accessed directly by name:
 *
 *   fsm -
 *     The finite state machine for this module.
 *
 *   canvas -
 *     The canvas on which to create the gui for this module
 *
 *   name -
 *     The name of this module
 *
 *   class -
 *     The class for this module
 *
 * @param menuItem {String}
 *   The name of the top-level menu that this module should be contained in.
 *
 * @param menuIcon {String}
 *   The icon to use for the top-level menu item.  (This is ignored except the
 *   first time a menuItem is seen.)
 *
 * @param moduleName {String}
 *   The name of the module being registered.  This is the name that will
 *   appear in the specified menu.
 *
 * @param clazz {clazz}
 *   The class which contains the module implementation.  That class must
 *   extend aiagallery.main.AbstractModule and implement a singleton interface
 *   that provides a public method called initialAppear() which takes this
 *   Module object as a parameter, and creates the finite state machine for
 *   the module (if applicable) and builds the graphical user interface for
 *   the module.
 */
qx.Class.define("aiagallery.main.Module",
{
  extend : qx.core.Object,

  construct : function(menuItem, menuIcon, moduleName, clazz, functionList)
  {
    this.base(arguments);

    // Initialize commonly-used properties of a module
    this.canvas = null;
    this.fsm = null;
    this.gui = null;

    // Save the module name
    this.name = moduleName;

    // Save this class name
    this.clazz = clazz;

    // If the menu has not been created, create it.
    if (!aiagallery.main.Module._list[menuItem])
    {
      aiagallery.main.Module._list[menuItem] = {};

      // Save the icon on the module-global icon list
      aiagallery.main.Module._icon[menuItem] = menuIcon;

      // Similarly, save any functions to be called, e.g. to add buttons
      // to the button bar, on the global function list
      aiagallery.main.Module._functionList[menuItem] = functionList;
    }

    // Add this new module to the module list.
    aiagallery.main.Module._list[menuItem][moduleName] = this;
  },

  statics :
  {
    getList : function()
    {
      return aiagallery.main.Module._list;
    },


    getIconList : function()
    {
      return aiagallery.main.Module._icon;
    },


    /**
     * Return the list of functions to be called (once) for each module
     */
    getFunctionList : function()
    {
      return aiagallery.main.Module._functionList;
    },


    /**
     * Return the icon for a specific menu item
     *
     * @param menuItem {String}
     *   The name of the menu item for which the icon is requested
     *
     * @return {String} 
     *   The icon associated with the specified menu item
     */
    getIcon : function(menuItem)
    {
      return aiagallery.main.Module._icon[menuItem];
    },


    /** The list of modules which have been registered. */
    _list : {},

    /** The icon associated with each menu item */
    _icon : {},

    /** The function list associated with each menu item */
    _functionList : {}
  }
});
