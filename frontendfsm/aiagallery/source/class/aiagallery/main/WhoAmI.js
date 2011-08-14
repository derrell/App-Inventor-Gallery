/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */


/**
 * The container and children to implement the who's-logged-in line on the GUI
 */
qx.Class.define("aiagallery.main.WhoAmI",
{
  extend  : qx.ui.core.Widget,

  construct : function()
  {
    var             layout;

    // Call the superclass constructor
    this.base(arguments);
    
    // Give ourself a layout
    layout = new qx.ui.layout.Grid();
    layout.setSpacingX(2);
    this._setLayout(layout);
  },

  properties :
  {
    /** This user's email address */
    email :
    {
      check : "String",
      apply : "_applyEmail"
    },
    
    /** This user's display name */
    displayName :
    {
      check : "String",
      apply : "_applyDisplayName"
    },
    
    /** Whether this user is an administrator */
    isAdmin :
    {
      check : "Boolean",
      apply : "_applyIsAdmin"
    },
    
    /** This user's permissions, as a comma-separated string */
    permissions :
    {
      check : "String",
      apply : "_applyPermissions"
    },
    
    /** The logout URL */
    logoutUrl :
    {
      check : "String",
      apply : "_applyLogoutUrl"
    }
  },

  members :
  {
    // apply function
    _applyEmail : function(value, old)
    {
      var control = this.getChildControl("email");
      if (control) 
      {
        control.setValue(value);
      }
    },

    // apply function
    _applyDisplayName : function(value, old)
    {
      var control = this.getChildControl("displayName");
      if (control) 
      {
        control.setValue(
          "(<a href='javascript:editProfile();'>" +
          value +
          "</a>)");
      }
    },

    // apply function
    _applyIsAdmin : function(value, old)
    {
      var control = this.getChildControl("isAdmin");
      if (control) 
      {
        control.setValue(value ? "Welcome, Administrator" : "Welcome,");
      }
    },

    // apply function
    _applyPermissions : function(value, old)
    {
      var control = this.getChildControl("permissions");
      if (control) 
      {
        control.setValue("Permissions: " +
                         (value.length === 0 ? "None" : value));
      }
    },

    // apply function
    _applyLogoutUrl : function(value, old)
    {
      var control = this.getChildControl("logoutUrl");
      if (control) 
      {
        control.setValue("<a href='" + value + "'>Logout</a>");
      }
    },

    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
      case "isAdmin" :
        control =
          new qx.ui.basic.Label(this.getIsAdmin() ? "Administrator" : "");
        control.setAnonymous(true);
        this._add(control, { row : 0, column : 0 });
        break;

      case "email":
        control = new qx.ui.basic.Label(this.getEmail());
        control.setAnonymous(true);
        this._add(control, { row : 0, column : 1 });
        break;

      case "displayName":
        control = new qx.ui.basic.Label(
          "(<a href='javascript:editProfile();'>" +
          this.getDisplayName() +
          "</a>)");
        control.setAnonymous(true);
        control.setRich(true);
        this._add(control, { row : 0, column : 2 });
        break;
        
      case "permissions":
        control = new qx.ui.basic.Label(this.getPermissions());
        control.setAnonymous(true);
        this._add(control, { row : 1, column : 0, colSpan : 4 });
        break;
        
      case "logoutUrl":
        control = new qx.ui.basic.Label(this.getLogoutUrl());
        control.setRich(true);
        control.setAnonymous(true);
        this._add(control, { row : 2, column : 0, colSpan : 4 });
        break;
      }

      return control || this.base(arguments, id);
    }
  }
});
