/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Theme.define("aiagallery.theme.Appearance",
{
  extend : qx.theme.modern.Appearance,

  appearances :
  {
    //
    // Radio View
    //

    "radioview" :
    {
      style : function(states)
      {
        return {
          contentPadding : 16
        };
      }
    },

    "radioview/bar" :
    {
      alias : "slidebar",

      style : function(states)
      {
        return {
          paddingLeft   : 20,
          paddingBottom : 8
        };
      }
    },

    "radioview/pane" :
    {
      style : function(states)
      {
        return {
          decorator : "tabview-pane",
          minHeight : 60,

          marginBottom : states.barBottom ? -1 : 0,
          marginTop : states.barTop ? -1 : 0,
          marginLeft : states.barLeft ? -1 : 0,
          marginRight : states.barRight ? -1 : 0
        };
      }
    },

    "radioview-page" : "widget",

    "radioview-page/button" :
    {
      alias : "atom",

      style : function(states)
      {
        var icon;
        if (states.checked && states.focused) {
          icon = "radiobutton-checked-focused";
        } else if (states.checked && states.disabled) {
          icon = "radiobutton-checked-disabled";
        } else if (states.checked && states.pressed) {
          icon = "radiobutton-checked-pressed";
        } else if (states.checked && states.hovered) {
          icon = "radiobutton-checked-hovered";
        } else if (states.checked) {
          icon = "radiobutton-checked";
        } else if (states.disabled) {
          icon = "radiobutton-disabled";
        } else if (states.focused) {
          icon = "radiobutton-focused";
        } else if (states.pressed) {
          icon = "radiobutton-pressed";
        } else if (states.hovered) {
          icon = "radiobutton-hovered";
        } else {
          icon = "radiobutton";
        }

        return {
          icon: "decoration/form/" + icon + ".png"
        };
      }
    }
  }
});
