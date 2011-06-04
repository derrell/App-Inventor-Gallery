/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * The graphical user interface for the gallery "find apps"" page
 */
qx.Class.define("aiagallery.module.dgallery.findapps.Gui",
{
  type : "singleton",
  extend : qx.core.Object,

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
      var             o;
      var             fsm = module.fsm;
      var             canvas = module.canvas;
      var             splitpane;
      var             hBox;
      var             vBox;
      var             groupbox;
      var             list;
      var             browse;
      var             gallery;

      // Create a splitpane. Top: browse and search; bottom: results
      splitpane = new qx.ui.splitpane.Pane("vertical");
      canvas.add(splitpane, { flex : 1 });

      // Create a horizontal box layout for the top pane
      hBox = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
      splitpane.add(hBox, 1);
      
      // Provide a bit of space at the left
      hBox.add(new qx.ui.core.Spacer(10));

      // Create a set of finder-style multi-level browsing lists
      groupbox = new qx.ui.groupbox.GroupBox("Browse");
      groupbox.setLayout(new qx.ui.layout.HBox());
      groupbox.setContentPadding(0);
      hBox.add(groupbox);

      // create and add the lists. Store them in an array.
      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse0", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse1", list);

      list = new qx.ui.form.List();
      list.setWidth(150);
      list.addListener("changeSelection", fsm.eventListener, fsm);
      groupbox.add(list);
      fsm.addObject("browse2", list);

      // Begin creating the search gui
      
      // groupbox will house all of the "lines of refinement", so is a VBox.
      // I believe I will need more specific access to this, so will probably need a variable (maybe a member somewhere)
      //      other than groupbox
      groupbox = new qx.ui.groupbox.GroupBox("Search") ;
      groupbox.setLayout( new qx.ui.layout.VBox()) ;
	
      // Canvas will house the Scroll-wrapped groupbox and the Buttonbar groupbox
      // FIXME: Need better layout (height and width) numbers for the following groupbox and scroll, make it look nice
      // FIXME: Since the groupbox is no longer the outer wrapper, the title "Search" goes away in the scroll.
      // FIXME: perhaps a new titling strategy for the page is needed
      
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
      var criteriascroll = new qx.ui.container.Scroll().set(
        {
          height : 330 ,
          width : 1000
        });
      
      groupbox.set(
        {
          height : 300,
          width : 1000,
          contentPadding : 3
        });
      
      // The groupbox gets wrapped by the Scroll
      criteriascroll.add(groupbox) ;
      
      // Dummy lines to see how my scroll vbox works
      for (var i = 0 ; i < 100 ; i++)
        groupbox.add(new qx.ui.form.Button("Hello! I'm #"+i+" and I'm a very long button for testing purposes! Eventually" + 
                                           " I will be replaced by a whole line of buttons and boxes. Life's grand.") );
      
      // buttonbar is where the search, reset, and possibly "add new search refinement" buttons go
      var buttonbar = new qx.ui.groupbox.GroupBox() ;
      buttonbar.set(
        {
          layout         : new qx.ui.layout.HBox(),
          contentPadding : 3
        });
      
      var searchbtn = new qx.ui.form.Button("Search On This") ;
      var resetbtn = new qx.ui.form.Button("Reset All Fields") ;
      buttonbar.add(resetbtn) ;
      buttonbar.add(searchbtn);
     
      // Finally, why the Canvas was used, to put the Scroll-wrapped box on top and the buttonbar on bottom easily
      container.add(criteriascroll, { top : 0 } ) ;
      container.add(buttonbar, { bottom: 0 } ) ;
      //FIXME: the following line, worked for the groupbox, but breaks now that I'm using a Canvas main wrapper.
      //container.getChildControl("frame").setBackgroundColor("white");
      
      // End search gui by adding it to hBox
      hBox.add(container, { flex : 1 });
      
      // Provide a bit of space at the right
      hBox.add(new qx.ui.core.Spacer(10));

      
      
      // Create a vertical box layout for the bottom pane
      vBox = new qx.ui.container.Composite(new qx.ui.layout.VBox(10));
      splitpane.add(vBox, 1);
      
      // Display 
      gallery = new aiagallery.widget.virtual.Gallery();
      gallery.addListener("changeSelection", fsm.eventListener, fsm);
      fsm.addObject("gallery", gallery);
      vBox.add(gallery, { flex : 1 });
    },

    /**
     * Construct and return a search refining line
     * 
     * 
     * @return new container with the empty search refining form
     */
    
    buildSearchRefineLine : function( container ) {
      var groupbox = new qx.ui.groupbox.GroupBox();
      
      
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
      var             response = rpcRequest.getUserData("rpc_response");
      var             requestType = rpcRequest.getUserData("requestType");
      var             gallery;
      var             apps;
      var             categories;
      var             tagMap;
      var             tagList;
      var             excludeTags;
      var             browse0 = fsm.getObject("browse0");
      var             browse1 = fsm.getObject("browse1");
      var             browse2 = fsm.getObject("browse2");
      var             nextList;
      var             selection;

      // We can ignore aborted requests.
      if (response.type == "aborted")
      {
          return;
      }

      if (response.type == "failed")
      {
        // FIXME: Add the failure to the cell editor window rather than alert
        alert("Async(" + response.id + ") exception: " + response.data);
        return;
      }

      // Successful RPC request.
      // Dispatch to the appropriate handler, depending on the request type
      switch(requestType)
      {
      case "getCategoryTags":
        response.data.result.forEach(
          function(tag)
          {
            // Add this tag to the list.
            browse0.add(new qx.ui.form.ListItem(tag));
          });
        break;
        
      case "appQuery":
        // Get the gallery object
        gallery = fsm.getObject("gallery");
        
        // Retrieve the app list and list of categories
        apps = response.data.result.apps;
        categories = response.data.result.categories;

        // FIXME: KLUDGE: should be able to update without remove/add!!!
        var parent = gallery.getLayoutParent();
        parent.remove(gallery);
        gallery = new aiagallery.widget.virtual.Gallery(apps);
        gallery.addListener("changeSelection", fsm.eventListener, fsm);
        fsm.addObject("gallery", gallery);
        parent.add(gallery);

        // Create a list of tags to exclude from this next level
        excludeTags = [];

        // Get the previous selections
        switch(rpcRequest.getUserData("tagResultsTo"))
        {
        case "browse2":
          nextList = browse2;

          // Retrieve the selection from browse1
          selection = browse1.getSelection();
          if (selection.length > 0)
          {
            excludeTags.push(selection[0].getLabel());
          }
          // fall through

        case "browse1":
          selection = browse0.getSelection();
          if (selection.length > 0)
          {
            excludeTags.push(selection[0].getLabel());
          }
          // fall through
          
        case "browse0":
          // nothing to do
          break;
        }
        
        // Create a single list of all of the resulting tags
        tagMap = {};
        for (var app = 0; app < apps.length; app++)
        {
          apps[app].tags.forEach(
            function(tag)
            {
              // If this tag is not a category
              tagMap[tag] = true;
            });
        }
        
        // Remove any items from the tag list that are already selected
        excludeTags.forEach(
          function(tag)
          {
            delete tagMap[tag];
          });

        // Convert the map into a tag list, and sort it.
        tagList = qx.lang.Object.getKeys(tagMap).sort();
        
        // Get the list to which we'll add each of these new tags
        nextList = fsm.getObject(rpcRequest.getUserData("tagResultsTo"));
        if (nextList)
        {
          // Add each tag to the next list
          tagList.forEach(
            function(tag)
            {
              nextList.add(new qx.ui.form.ListItem(tag));
            });
        }

        break;

      default:
        throw new Error("Unexpected request type: " + requestType);
      }
    }
  }
});
