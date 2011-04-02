/**
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

/**
 * Abstract Module class.  All modules should extend this class.
 */
qx.Class.define("aiagallery.main.AbstractModule",
{
  type : "abstract",
  extend : qx.core.Object,

  members :
  {
    /**
     * Build the initial finite state machine.
     *
     * In order to prevent long load times, as minimal as possible of an
     * initial FSM should be created.  The FSM will receive an "appear" event
     * when the module is first selected (and each subsequent time), and the
     * FSM can use that event to build the complete FSM.
     *
     * @param module {aiagallery.main.Module}
     *   The module descriptor for the module.
     */
    buildInitialFsm : function(module)
    {
      // Create a new finite state machine
      var fsm = new aiagallery.util.FiniteStateMachine(module.name);

      // Disable FSM debugging
      fsm.setDebugFlags(0);

      /*
       * State: Idle
       *
       * Transition on:
       *  "appear" on main.canvas
       */
      var state = new qx.util.fsm.State("State_Idle",
      {
        "context" : this,

        "events" :
        {
          // When we get an appear event the first time, run the transition
          // that will load the module's finite state machine and graphical
          // user interface.
          "appear" :
          {
            "main.canvas" : "Transition_Idle_to_Idle_Load_Gui"
          }
        }
      });

      fsm.addState(state);

      /*
       * Transition: Idle to (replaced) Idle
       *
       * Cause: "appear" on canvas for the first time
       *
       * Action:
       *  Load module's finite state machine and graphical user interface
       */

      var newModule = module;

      var trans =
        new qx.util.fsm.Transition("Transition_Idle_to_Idle_Load_Gui",
      {
        "context" : this,

        "nextState" : qx.util.fsm.FiniteStateMachine.StateChange.CURRENT_STATE,

        "ontransition" : function(fsm, event)
        {
          // Call the module's initialAppear function to build FSM and GUI.
          // That function should *replace* this state, State_Idle, to which
          // we'll transition.
          var             canvas = fsm.getObject("main.canvas");

          qx.core.Init.getApplication().constructor.progressCursor(true);

          if (!newModule.bLoaded)
          {
            qx.util.TimerManager.getInstance().start(
              function(userData, timerId)
              {
                // Call the module's initial appear handler
                this.initialAppear(newModule);

                // Regenerate the appear event, since the original one got
                // lost by doing this code inside of the timeout.
                canvas.fireEvent("appear");

                // Reset the cursor to the default
                qx.core.Init.getApplication().constructor.progressCursor(false);
              },
              0,
              this,
              null,
              0);

            newModule.bLoaded = true;
          }
        }
      });

      state.addTransition(trans);

      // Save the finite state machine for this module
      module.fsm = fsm;

      // Save the module descriptor in the finite state machine
      fsm.addObject("main.module", module);

      // Create an RPC object for use by this module
      module.rpc = new qx.io.remote.Rpc();
      module.rpc.setUrl(aiagallery.main.Constant.SERVICES_URL);
      module.rpc.setTimeout(10000);
      module.rpc.setCrossDomain(false);
      module.rpc.addListener("completed", fsm.eventListener, fsm);
      module.rpc.addListener("failed",    fsm.eventListener, fsm);
      module.rpc.addListener("timeout",   fsm.eventListener, fsm);
      module.rpc.addListener("aborted",   fsm.eventListener, fsm);
      fsm.addObject("main.rpc", module.rpc);

      // Start the finite state machine
      fsm.start();
    },


    /**
     * Build the initial graphical user interface.
     *
     * Generally, this is a no-op.
     *
     * @type member
     *
     * @param module {Object}
     *   An object containing at least the following properties:
     *     fsm -
     *       The finite state machine for this module.  It should be filled in
     *       by this function.
     *     canvas -
     *       The canvas on which to create the gui for this module
     *     name -
     *       The name of this module
     *     clazz -
     *       The class for this module
     *
     * @return {void}
     */
    buildInitialGui : function(module)
    {
      // nothing to do
    }
  }
});
