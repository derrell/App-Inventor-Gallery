/**
 * Add a "callRpc" event as part of a standard FiniteStateMachine.
 *
 * Copyright (c) 2011 Derrell Lipman
 * 
 * License:
 *   LGPL: http://www.gnu.org/licenses/lgpl.html 
 *   EPL : http://www.eclipse.org/org/documents/epl-v10.php
 */

qx.Class.define("aiagallery.util.FiniteStateMachine",
{
  extend : qx.util.fsm.FiniteStateMachine,

  events :
  {
    "callRpc" : "qx.event.type.DataEvent"
  }
});
