/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the individual application pages
 */
qx.Class.define("aiagallery.module.dgallery.appinfo.Gui",
{
  type : "singleton",
  extend : qx.core.Object,

  statics: 
  {
    // Returns the type of the object passed as a parameter as a string
    typeOf: function (value) 
    {
      var s = typeof value;
      if (s === 'object') 
        {
          if (value) 
          {
            if (value instanceof Array) 
            {
              s = 'array';
            }
          } else 
            {
              s = 'null';
            }
        }
      return s;
    },

        // Returns a string version of an arbitrary value
    stringOf: function(value) 
    {
      // Determine the type of the value passed as a parameter
      var ty = aiagallery.module.dgallery.appinfo.Gui.typeOf(value);
      var stringOf =  aiagallery.module.dgallery.appinfo.Gui.stringOf;
            
      switch (ty)
      {
        case "string":
          return "'" + value + "'";

        case "boolean": 
          if (value) 
          {
            return "true";
          } else 
          {
            return "false";
          }

        case "number":
          return value + "";
    
        case "array":
          var len = value.length;
          if (len == 0) 
          {
            return "[]";
          } 
            else 
            {
              var str = "[";
              for ( var i = 0, len = value.length; i < len-1; ++i)
              {
                str += stringOf(value[i]) + ", \n";
              }
                str += stringOf(value[len-1]) + "]";
                return str;
            }

        case "object":
          var prop;
          str = "{"
          for (prop in value) 
          {
            str += prop + ":" + stringOf(value[prop]) + ", \n";
          }
            str += "}";
            return str;
          
        default:
          return ty;
      }
    }
  },

  members :
  {
    /**
     * Build the raw graphical user interface.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildGui : function(module)
    {
    },


    /**
     * Handle the response to a remote procedure call
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     *
     * @param rpcRequest {var}
     *   The request object used for issuing the remote procedure call. From
     *   this, we can retrieve the response and the request type.
     */
    handleResponse : function(module, rpcRequest)
    {
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             result; 
      var             commentData = rpcRequest.getUserData("commentData");

      if (response.type == "failed")
      {
        // FIXME: Add the failure to someplace reasonable, instead of alert()
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getAppInfo":
        var             o;
        var             groupbox;
        var             appInfoContainer;
        var             commentContainer;
        var             scrollContainer;
        var             vbox;
        var             splitpane;
        var             radiogroup;
        var             cpanel;
        var             text;
        var             label;

        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // Add a groupbox with the application title
        groupbox = new qx.ui.groupbox.GroupBox(result.title);
        groupbox.setLayout(new qx.ui.layout.Canvas());
        canvas.setLayout(new qx.ui.layout.Canvas());
        canvas.add(groupbox, { edge : 10 });

        // Create a grid layout for the application info
        var layout = new qx.ui.layout.Grid(10, 10);
        layout.setColumnAlign(0, "right", "middle");
        layout.setColumnAlign(1, "left", "middle");
        layout.setColumnAlign(2, "left", "middle");

        layout.setColumnWidth(0, 200);
        layout.setColumnWidth(1, 200);
        layout.setColumnWidth(2, 200);

        layout.setSpacing(10);

        // Create a container for the application info, and use the grid layout.
        appInfoContainer = new qx.ui.container.Composite(layout);
        

        // Yes. We'll create a splitpane, with the application info on the
        // left, and comment viewing on the right.
        splitpane = new qx.ui.splitpane.Pane("horizontal");
        groupbox.add(splitpane, { edge : 10 });

         
        // Add the application info container to the splitter
        splitpane.add(appInfoContainer, 1);

        // Create a group for the comment collapsable pannel
        radiogroup = new qx.ui.form.RadioGroup();
        radiogroup.setAllowEmptySelection(true);
          
        // We'll put all of the collapsable panels in a scroll container
        scrollContainer = new qx.ui.container.Scroll();
        splitpane.add(scrollContainer, 1);
          
        // Put a vbox container in the scroll container
        vbox = new qx.ui.container.Composite(new qx.ui.layout.VBox());
        scrollContainer.add(vbox);

       // Sets the app's uid as a variable which can be passed to the FSM
       var appId = result.uid;

       // Creates an object on which to call the getComments event, in order
       // to add them to the GUI
       var emptyObject = new qx.core.Object();
       emptyObject.setUserData("filler", new qx.core.Object());
       fsm.addObject("ignoreMe", emptyObject);
       fsm.fireImmediateEvent("appearComments", emptyObject, null);

       // Adds the textfield for entering a comment
       var commentInput = new qx.ui.form.TextField();
       commentInput.setPlaceholder("Type your comment here:");
       var allCommentsBox = new qx.ui.container.Composite(new qx.ui.layout.VBox());

       // Wrapping everything relevant to a comment in one object,
       // to be passed to the FSM
       var commentWrapper = new qx.core.Object();
       commentWrapper.setUserData("appId", appId);
       commentWrapper.setUserData("commentInput", commentInput);
       fsm.addObject("commentWrapper", commentWrapper);

       // Adds the button for submitting a comment to the FSM
       var submitCommentBtn = new qx.ui.form.Button("Submit Comment");
       fsm.addObject("submitCommentBtn", submitCommentBtn);
       submitCommentBtn.addListener(
         "execute", 
         function(e) 
         {
           var comment = commentInput.getValue();
           // Is the submitted comment null, or empty spaces?
           if ((comment != null) 
              && ((comment.replace(/\s/g, '')) != ""))
           // No: submit it
           {
             fsm.eventListener(e);
           }
           // Yes: clear input box and do nothing
           else
           {
             commentInput.setValue(null);
           }
         },
         fsm);
          
       // Lets the user call "execute" by pressing the enter key rather
       // than by pressing the submitCommentBtn
       commentInput.addListener(
         "keypress",
         function(e)
         {
           if (e.getKeyIdentifier() === "Enter")
           {
             submitCommentBtn.execute();
           }
         });      
  
        // The textfield, all the existing comments, and the submit button
        // get added to the UI.
        vbox.add(commentInput);
        vbox.add(submitCommentBtn);
        vbox.add(allCommentsBox); 

        // Creates an object containing the parts of the GUI which will need 
        // to be changed after the fsm call. This object is passed to the FSM.
        var guiWrapper = new qx.core.Object();
        guiWrapper.setUserData("vbox", vbox);
        guiWrapper.setUserData("cpanel", cpanel);
        guiWrapper.setUserData("radiogroup", radiogroup);
        guiWrapper.setUserData("commentInput", commentInput);
        guiWrapper.setUserData("allCommentsBox", allCommentsBox);
        fsm.addObject("guiWrapper", guiWrapper);


        appInfoContainer.add(new qx.ui.basic.Image(result.image1),
                             { row : 1, column : 1 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image2),
                             { row : 1, column : 0 });
        appInfoContainer.add(new qx.ui.basic.Image(result.image3),
                             { row : 1, column : 2 });
        
        appInfoContainer.add(new qx.ui.basic.Label("Description: "),
                             { row : 2, column : 0 });
        o = new qx.ui.basic.Label(result.description);
        o.set(
          {
            rich : true,
            wrap : true
          });
        appInfoContainer.add(o,
                             { row : 2, column : 1, colSpan : 3 });
        
        [
          { label : "Owner",     data : result.owner,        row : 3 },
          { label : "Uploaded",  data : result.uploadTime,   row : 4 },
          { label : "Tags",      data : result.tags,         row : 5 },
          { label : "Status",    data : result.status,       row : 6 },
          { label : "Likes",     data : result.numLikes,     row : 7 },
          { label : "Downloads", data : result.numDownloads, row : 8 },
          { label : "Views",     data : result.numViewed,    row : 9 },
          { label : "Comments",  data : result.numComments,  row : 10 }
        ].forEach(
          function(field)
          {
            appInfoContainer.add(new qx.ui.basic.Label(field.label + ": "),
                                 { row : field.row, column : 0 });
            appInfoContainer.add(new qx.ui.basic.Label(field.data + ""),
                                 { row : field.row, column : 1, colSpan : 2 });
          });
        
        break;
        
      case "addComment":
        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // Gets the objects sent from the GUI to the FSM. 
        var guiInfo = rpcRequest.getUserData("guiInfo");
        var vbox = guiInfo.getUserData("vbox");
        var cpanel = guiInfo.getUserData("cpanel");
        var radiogroup = guiInfo.getUserData("radiogroup");
        var commentInput = guiInfo.getUserData("commentInput");
        var allCommentsBox = guiInfo.getUserData("allCommentsBox");
        var newComment;
        var commentAuthor;
        var commentTime;
        var ty; 
        var replyBtn;
        var hbox;
        var vbox2;
        var label2;

        ty = this.self(arguments).typeOf(result);

        // Adds the new comment to the GUI
        // Currently, the 'reply' and 'flag as inappropiate' buttons 
        // do not do anything
        if (ty != null) 
        {
          newComment = result["text"];
          if (newComment != null) 
          {
            commentAuthor = result["visitor"];
            commentTime = result["timestamp"];
            cpanel = new collapsablepanel.Panel(commentAuthor + ": " + newComment);
            cpanel.setGroup(radiogroup);
            
            replyBtn = new qx.ui.form.Button("reply");
            label = new qx.ui.basic.Label(newComment);
            label.set(
              {
                rich : true,
                wrap : true,
                selectable: true // Allow user to select text
              });
            label2 = new qx.ui.basic.Label("   posted: " + commentTime);
            label2.set(
              {
                rich : true,
                wrap : true,
                selectable: true // Allow user to select text
              });
            hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
            vbox2 = new qx.ui.container.Composite(new qx.ui.layout.VBox());
            hbox.add(replyBtn);
            vbox2.add(label);
            hbox.add(label2);
            vbox2.add(hbox);
            cpanel.add(vbox2);
            allCommentsBox.addAt(cpanel, 0, null);
            vbox.add(allCommentsBox);
          }
        }
        commentInput.setValue(null);
        break;

      case "getComments":
        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // This alert shows that addComments is reusing uids 
        //alert("getComments result is: " + this.self(arguments).stringOf(result));

        // Gets back the objects passed from the GUI to the FSM
        var guiInfo = rpcRequest.getUserData("guiInfo");
        var vbox = guiInfo.getUserData("vbox");       
        var radiogroup = guiInfo.getUserData("radiogroup");
        var allCommentsBox = guiInfo.getUserData("allCommentsBox");
        var ty;
        var len
        var newComment;
        var commentAuthor;
        var commentTime;
        var replyBtn;
        var hbox;
        var vbox2;
        var label2;
  
        // Adds the comments retrieved from the database to the GUI
        // Currently, the 'reply' and 'flag as inappropiate' buttons 
        // do not do anything
        ty = this.self(arguments).typeOf(result);
        if (ty == "array") 
        {
          len = result.length;
          if (len != 0) 
          {
            for (var i = 0; i < result.length; ++i)
            {
              newComment = result[i]["text"];
              if (newComment != null)
              {
                commentAuthor = result[i]["visitor"];
                commentTime = result[i]["timestamp"];
                cpanel = new collapsablepanel.Panel(commentAuthor + ": " + newComment);
                cpanel.setGroup(radiogroup);

                replyBtn = new qx.ui.form.Button("reply");
                label = new qx.ui.basic.Label(newComment);
                label.set(
                  {
                    rich : true,
                    wrap : true,
                    selectable: true // Allow user to select text
                  });
                label2 = new qx.ui.basic.Label("   posted: " + commentTime);
                label2.set(
                  {
                    rich : true,
                    wrap : true,
                    selectable: true // Allow user to select text
                  });
                hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                vbox2 = new qx.ui.container.Composite(new qx.ui.layout.VBox());
                hbox.add(replyBtn);
                vbox2.add(label);
                hbox.add(label2);
                vbox2.add(hbox);
                cpanel.add(vbox2);
                allCommentsBox.addAt(cpanel, 0, null);
                vbox.add(allCommentsBox);
              }
            }
          }
        }   
        break;
      
      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});