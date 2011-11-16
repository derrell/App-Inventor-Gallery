/**
 * Copyright (c) 2011 Derrell Lipman
 *
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/*
#require(aiagallery.module.dgallery.appinfo.Jsqr)
#ignore(JSQR)
*/

/**
 * The graphical user interface for the individual application pages
 */

qx.Class.define("aiagallery.module.dgallery.appinfo.Gui",
{

  // Declares resources to be used for icons
  /**
  #asset(qx/icon/Oxygen/16/status/dialog-warning.png)
  #asset(qx/icon/Oxygen/16/status/dialog-error.png)
  #asset(qx/icon/Oxygen/16/emotes/face-smile.png)
  #asset(qx/icon/Tango/16/apps/internet-download-manager.png)
  */

  extend : qx.core.Object,

  construct : function()
  {
    // The following non-primitive instance variables must be initialized
    // in the constructor so that different instances don't
    // point to the same object.
    // See the "Primitive Types vs. Reference Types" section of
    // http://manual.qooxdoo.org/1.5.x/pages/core/classes.html

    // Label to display number of views and likes.
    this.__viewsLikesLabel = new qx.ui.basic.Label();

    // Vbox container for comments, inside scrollContainer
    this.__allCommentsBox = new qx.ui.container.Composite(
      new qx.ui.layout.VBox());

    // Text field for entering a comment
    this.__commentInputField = new qx.ui.form.TextField();
  },

  members :
  {
    // Private instance variables.
    __views : null,
    __likes : null,
    __viewsLikesLabel : null,
    __vbox : null,
    __allCommentsBox : null,
    __commentInputField : null,

    // Helper methods

    /*
     * Update views and likes label to reflect current values
     * of views and likes
     */
    __updateViewsLikesLabel : function()
    {
      this.__viewsLikesLabel.setValue('<b>' + this.__views +
                                       ' views, ' +
                                       this.__likes + ' likes</b>');
    },

    /**
     * Create a panel containing a single comment to the GUI
     *
     * Comment will be shown as a 2-element vbox:
     * Top line: visitor: comment text
     * 2nd line: time stamp (grey, small)
     *
     * @param comment {String}
     *   The comment to be displayed
     *
     * @return {qx.ui.container.Composite}
     *   A container with a vertical box layout, containing the information
     *   about this comment.
     */
    __createCommentPanel : function(comment)
    {
      // Comment info to be displayed
      // These are the 3 fields of interest to a viewer
      // (the rest is metadata -- app ID, tree ID, numChildren)
      var commentText = comment["text"];
      var commentAuthor = comment["visitor"];
      var commentTime = comment["timestamp"];
      // var treeId = comment["treeId"];

      // Top line
      var visitorAndComment =  '<b>' + commentAuthor + ': </b>' + commentText;
      var visitorAndCommentLabel = new qx.ui.basic.Label(visitorAndComment);
      visitorAndCommentLabel.set(
        {
          rich : true,
          wrap : true,
          selectable : true
        });

      // Timestamp, easier on the eye than the default.
      // (which could use some additional tweaking, perhaps)
      // FIXME: This needs to be internationalized. There are existing
      // functions to do so.
      var dateObj = new Date(commentTime); //not sure what to do here..
      var dateString = dateObj.toDateString();
      var timeString = dateObj.getHours() + ":" + dateObj.getMinutes();
      var dateTimeString = dateString + " " + timeString + " ET";

      // 2nd line
      var postedStringStart =
        '<span style="color:grey;font-size:75%">Posted: ';
      var postedString = postedStringStart + dateTimeString + '</span>';
      var postedStringLabel = new qx.ui.basic.Label(postedString);
      postedStringLabel.set(
        {
          rich : true,
          wrap : true,
          selectable : true
        });

      // Entire comment box
      var commentLayout = new qx.ui.layout.VBox();
      var commentBox = new qx.ui.container.Composite(commentLayout);
      // Thin grey solid border
      commentBox.setDecorator(new qx.ui.decoration.Single(1,
                                                          'solid',
                                                          '#cccccc'));
      // Add the pieces
      commentBox.add(visitorAndCommentLabel);
      commentBox.add(postedStringLabel);

      // Return the box we just created.
      return commentBox;
    },


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
      var             comment;
      var             comments;
      var             vboxLeft;
      var             vboxRight;
      var             hbox;
      var             appId;
      var             hboxLayout;
      var             title;
      var             appIcon;
      var             createdBy;
      var             likeItButton;
      var             flagItButton;
      var             emptyObject;
      var             commentWrapper;
      var             submitCommentButton;
      var             scrollContainer;
      var             downloadBtn;
      var             hboxFlagLike;
      var             downloadLabel;
      var             download;
      var             space;
      var             spacer;
      var             descriptionHeader;
      var             description;
      var             tagsHeader;
      var             tags;
      var             guiInfo;
      var             ty;
      var             vbox2;
      var             label2;
      var             label;
      var             newBox;
      var             len;
      var             i;
      var             qrCode;
      var             hboxQRCode;
      var             qr;

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
        // Get the result data. It's an object with all of the application info.
        result = response.data.result;

        // Get some app data
        appId = result.uid;
        this.__likes = result.numLikes;
        this.__views = result.numViewed;

        // Create a horizontal box layout to store two vboxes in.
        hboxLayout = new qx.ui.layout.HBox();

        // Add a nice little seperation between the two.
        hboxLayout.setSpacing(4);

        // Apply the layout to a container then set some properties on it.
        hbox = new qx.ui.container.Composite(hboxLayout);
        hbox.setDecorator(new qx.ui.decoration.Single(3,'solid','#afafaf'));
        hbox.set(
          {
            maxWidth : 1024,
            width : 1024
          });

        // Create the left vertical box container.
        vboxLeft = new qx.ui.container.Composite(new qx.ui.layout.VBox());

        // Make it purty.
        vboxLeft.setBackgroundColor("#f3f3f3");

        // Add it to the horizontal box, with the flex property to use all
        // unused space.
        hbox.add(vboxLeft, { flex : 1 });

        // Create the right vertical box container.
        vboxRight = new qx.ui.container.Composite(new qx.ui.layout.VBox());

        // Make it purty as well.
        vboxRight.setBackgroundColor("#f3f3f3");

        // Add it the horizontal box.
        hbox.add(vboxRight, { flex : 2 });

        // Store a nice title.
        title = new qx.ui.basic.Label('<b style="font-size:25px">' +
                                      result.title + '</b>');

        // Set it to use rich formatting and center it in the vbox.
        title.set(
          {
            rich : true,
            alignX : "center"
          });

        // Add it to the left display.
        vboxLeft.add(title);

        // Create an image widget with the image1 image stored for the app.
        appIcon = new qx.ui.basic.Image(result.image1);

        // Center it.
        appIcon.setAlignX("center");

        // Add it to the left display.
        vboxLeft.add(appIcon);

        // Create a label describing who created the app.
        createdBy = new qx.ui.basic.Label('Created by <b>' +
                                              result.owner + '</b>');

        // Make it purty with rich formatting.
        createdBy.set(
          {
            rich : true
          });

        // Center it.
        createdBy.setAlignX("center");

        // Add it to the left vbox.
        vboxLeft.add(createdBy);

        // Initialize it
        this.__updateViewsLikesLabel();

        // Set the views and likes label to use rich formatting,
        // and center it.
        this.__viewsLikesLabel.set(
          {
            rich : true,
            AlignX : "center"
          });

        // Add it to the left vbox.
        vboxLeft.add(this.__viewsLikesLabel);

        // Create a horizontal box for the next two buttons
        hboxFlagLike =
          new qx.ui.container.Composite(new qx.ui.layout.HBox(10));

        // Create a download button to allow to user to download the application
        downloadBtn = new qx.ui.form.Button("Download", "qx/icon/Tango/16/apps/internet-download-manager.png");
        fsm.addObject("downloadBtn", downloadBtn);
        downloadBtn.addListener(
          "execute",
          function(e) {
            location.href = 'rpc?getdata=' + appId + ':source';
          },
          null);

        // Add it to the left vbox
        vboxLeft.add(downloadBtn);


        // Create a button to allow users to "like" things.
        this.likeItButton =
          new qx.ui.form.Button("Like it!",
                                "qx/icon/Oxygen/16/emotes/face-smile.png");
        fsm.addObject("likeItButton", this.likeItButton);
        this.likeItButton.addListener("execute", fsm.eventListener, fsm);

        // If this user has already liked this app...
        if (result.bAlreadyLiked)
        {
          // ... then disable the Like It! button
          this.likeItButton.setEnabled(false);
        }

        // Add it to the left vbox.
        vboxLeft.add(this.likeItButton);

        // Create a button to allow users to "flag" things.
        // FIXME: Implement this
        flagItButton = new aiagallery.widget.Button("Flag it!",
                         "qx/icon/Oxygen/16/status/dialog-error.png");

        // Add likeItButton to the hbox.
        hboxFlagLike.add(this.likeItButton, { flex : 1 });

        // Add flagItButton to the hbox.
        hboxFlagLike.add(flagItButton, { flex : 1 });

	// Add hboxFlagLike to left vbox
        vboxLeft.add(hboxFlagLike);

        // Creates an object on which to call the getComments event, in order
        // to add them to the GUI
        emptyObject = new qx.core.Object();
        emptyObject.setUserData("filler", new qx.core.Object());
        fsm.addObject("ignoreMe", emptyObject);
        fsm.fireImmediateEvent("appearComments", emptyObject, null);

        // Placeholder text
        this.__commentInputField.setPlaceholder("Type your comment here:");

        // Wrap everything relevant to a comment in one object,
        // to be passed to the FSM
        commentWrapper = new qx.core.Object();
        commentWrapper.setUserData("appId", appId);
        commentWrapper.setUserData("commentInputField", this.__commentInputField);
        fsm.addObject("commentWrapper", commentWrapper);

        // Adds the button for submitting a comment to the FSM
        submitCommentButton = new qx.ui.form.Button("Submit Comment");
        fsm.addObject("submitCommentButton", submitCommentButton);

        submitCommentButton.addListener(
          "execute",
          function(e)
          {
            var commentInputText = this.__commentInputField.getValue();

            // Is the submitted comment null or whitespace?
            if ((commentInputText != null)
              && ((commentInputText.replace(/\s/g, '')) != ""))
            // No: submit it
            {
              fsm.eventListener(e);
            }
            //Yes: clear input box and do nothing.
            else
            {
              this.__commentInputField.setValue(null);
            }
          },
          this);

        // Allow comment to be entered using enter key instead of button.
        // If multi-line comments are allowed in the future, we might not
        // want to do this.
        this.__commentInputField.addListener(
          "keypress",
          function(e)
          {
            if (e.getKeyIdentifier() === "Enter")
            {
              submitCommentButton.execute();
            }
          });

        // Add the textfield and submit button to the UI.
        vboxLeft.add(this.__commentInputField);
        vboxLeft.add(submitCommentButton);

        // Add a scroll container containing the comment list.
        scrollContainer = new qx.ui.container.Scroll();
        scrollContainer.add(this.__allCommentsBox);
        vboxLeft.add(scrollContainer);


        // Right Vbox

        // Create a label to represent a link to download the app.
        // FIXME: Add a link here
        downloadLabel =
          new qx.ui.basic.Label('<b>Download ' + result.title + '!</b>');

        // Set it to use rich formatting
        downloadLabel.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(downloadLabel);

        // Create a label to store the number of downloads
        download = new qx.ui.basic.Label(result.title +
                                             ' has been downloaded ' +
                                             result.numDownloads +
                                             ' times.');

        // Set it to use rich formatting and to wrap text.
        download.set(
          {
            rich : true,
            wrap : true
          });
        vboxRight.add(download);

        // Create a label just to space things out a bit.
        spacer = new qx.ui.basic.Label('');

        // Add it to the right vbox.
        vboxRight.add(spacer);

        // Create a label to store the header "Description".
        descriptionHeader = new qx.ui.basic.Label('<b>Description</b>');

        // Set it to use rich formatting.
        descriptionHeader.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(descriptionHeader);

        // Create a label to store the actual description of the app.
        description = new qx.ui.basic.Label(result.description);

        // Set the label to use rich formatting and automatically wrap text.
        description.set(
          {
            rich : true,
            wrap : true
          });

        // Add it to the right vbox.
        vboxRight.add(description);

        // Create a label to use as a spacer.
        spacer = new qx.ui.basic.Label('');

        // Add it to the right vbox.
        vboxRight.add(spacer);

        // Create a label to store the "Tags" header
        tagsHeader = new qx.ui.basic.Label('<b>Tags</b>');

        // Set it to use rich formatting.
        tagsHeader.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(tagsHeader);

        // Create a label with the actual tags.
        tags = new qx.ui.basic.Label(result.tags);

        // Set it to use rich formatting.
        tags.set(
          {
            rich : true
          });

        // Add it to the right vbox.
        vboxRight.add(tags);


        //If canvas is not supported by browser
        if (!qx.core.Environment.get("html.canvas"))
        {
          var hboxShortURL =
            new qx.ui.container.Composite(new qx.ui.layout.HBox());
          var shortURL =
            "http://app-inventor-gallery.appspot.com/rpc?getdata=" +
            appId +
            ":apk";

          //Create a space and a download label.
          space = new qx.ui.basic.Label('');
          downloadLabel = new qx.ui.basic.Label('<b> Download! </b>');
          downloadLabel.set(
          {
            rich:true
          });

          vboxRight.add(space);
          vboxRight.add(downloadLabel);

          hboxShortURL.add(new qx.ui.basic.Label(shortURL).set({
                rich : true,
                alignX: "center",
                alignY: "middle"
            }));

          vboxRight.add(hboxShortURL);
        }
        else
        {
          // Create a new jsqr and code object to genereate the qr code.
          qr = new JSQR();
          var code = new qr.Code();

          // Set the code datatype.
          code.encodeMode = code.ENCODE_MODE.BYTE;

          //Set the code version.
          //DEFAULT = use the smallest possible version.
          code.version = code.DEFAULT;

          // Set the error correction level (H = High).
          code.errorCorrection = code.ERROR_CORRECTION.H;

          var input = new qr.Input();

          // Specify the data type of 'data'. Encoding a URL, which is text.
          input.dataType = input.DATA_TYPE.TEXT;

          //The url of the download link to encode into a qr code.
          input.data =
            "http://app-inventor-gallery.appspot.com/rpc?getdata=" +
            appId +
            ":apk";

          //This generates the qr code matrix.
          var matrix = new qr.Matrix(input, code);
          matrix.scale = 4;
          matrix.margin = 2;


          //Create a new canvas element in which to draw the qr code
          qrCode = new qx.ui.embed.Canvas();

          qrCode.set(
            {
              canvasWidth: matrix.pixelWidth,
              canvasHeight: matrix.pixelWidth,
              width: matrix.pixelWidth,
              syncDimension: false
            });


          // When the Canvas element is available or when screen is refreshed
          qrCode.addListener(
          "redraw",
          function(e)
          {

            // Get the canvas content.
            var data = e.getData();
            var ctx = data.context;

            // Set the foreground color of the canvas to black.
            ctx.fillStyle = "rgb(0,0,0)";

            // Get the content part of the widget, which is the canvas DOM object.
            var domCanvas = qrCode.getContentElement().getCanvas();

            // Draw the qr code matrix on the canvas at point (0,0).
            matrix.draw( domCanvas, 0, 0);

          },
          this);

          // Add some space before the qr code image
          var space = new qx.ui.basic.Label('');
          vboxRight.add(space);

          // Create a horizontal box layout for the QR Code and a spacer
          hboxQRCode = new qx.ui.container.Composite(new qx.ui.layout.HBox());
          hboxQRCode.setHeight(matrix.pixelWidth);
          hboxQRCode.add(qrCode);

          // Add a spacer to take up the remaining space not used by qrCode
          hboxQRCode.add(new qx.ui.core.Widget(), { flex : 1 });

          vboxRight.add(hboxQRCode);
        }

        canvas.setLayout(new qx.ui.layout.HBox());

        canvas.add(new qx.ui.core.Widget(), { flex : 1 });
        canvas.add(hbox);
        canvas.add(new qx.ui.core.Widget(), { flex : 1 });
        break;

      case "addComment":
        // Get result data--in this case, the comment that was added.
        comment = response.data.result;

        // Add the new comment to the GUI, if nonempty.
        if (comment["text"] != null)
        {
          newBox = this.__createCommentPanel(comment);

          // Insert the new comment at the top of the list
          this.__allCommentsBox.addAt(newBox, 0, null);
        }

        this.__commentInputField.setValue(null);
        break;

      case "getComments":
        // Get the result data--here, the list of comments for this app.
        comments = response.data.result;

        // Add comments retrieved from the database to the GUI
        ty = qx.lang.Type.getClass(comments);
        if (ty == "Array")
        {
          len = comments.length;
          if (len != 0)
          {
            for (i = 0; i < len; ++i)
            {
              comment = comments[i];
              if (comment["text"] != null)
              {
                newBox = this.__createCommentPanel(comment);

                // Insert the new comment at the top of the list
                this.__allCommentsBox.addAt(newBox, 0, null);
              }
            }
          }
        }
        break;

      case "likesPlusOne":
        // Update like count from RPC (don't just increment it; that
        // might be wrong)
        this.__likes = response.data.result;

        // Update views and likes label
        this.__updateViewsLikesLabel();

        // Disable the likeItButton since a user cannot
        // like more than once.
        this.likeItButton.setEnabled(false);

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
