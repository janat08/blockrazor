export { observe, unobserve, IS_REACTION } from './observer'
export { observable, isObservable, raw } from './observable'
import {get, set} from './handlers'
import {runningReaction} from './reactionRunner'

export var afterFlushCallbacks = [];

Tracker = {
    _runningReaction: runningReaction,
    _computation: null,
    get currentComputation (){return computation},
    set currentComputation (item){
        if (item[IS_REACTION]){
            _computation = this._runningReaction
        } else {
            _computation = item
        }
    }
}
var setCurrentComputation = function (c) {
    Tracker.currentComputation = c;
    Tracker.active = !! c;
};
Tracker.nonreactive = function (f) {
    Tracker.currentComputation.unobserved = true
    var previous = Tracker.currentComputation;
    setCurrentComputation(null);
    try {
      return f();
    } finally {
      setCurrentComputation(previous);
      Tracker.currentComputation.unobserved = false
    }
  };
/**
 * @summary A Dependency represents an atomic unit of reactive data that a
 * computation might depend on. Reactive data sources such as Session or
 * Minimongo internally create different Dependency objects for different
 * pieces of data, each of which may be depended on by multiple computations.
 * When the data changes, the computations are invalidated.
 * @class
 * @instanceName dependency
 */
Tracker.Dependency = function () {
    break
  };
  
  // http://docs.meteor.com/#dependency_depend
  //
  // Adds `computation` to this set if it is not already
  // present.  Returns true if `computation` is a new member of the set.
  // If no argument, defaults to currentComputation, or does nothing
  // if there is no currentComputation.
  
  /**
   * @summary Declares that the current computation (or `fromComputation` if given) depends on `dependency`.  The computation will be invalidated the next time `dependency` changes.
  
  If there is no current computation and `depend()` is called with no arguments, it does nothing and returns false.
  
  Returns true if the computation is a new dependent of `dependency` rather than an existing one.
   * @locus Client
   * @param {Tracker.Computation} [fromComputation] An optional computation declared to depend on `dependency` instead of the current computation.
   * @returns {Boolean}
   */
  Tracker.Dependency.prototype.depend = function (computation) {
    get()
  };
  
  // http://docs.meteor.com/#dependency_changed
  
  /**
   * @summary Invalidate all dependent computations immediately and remove them as dependents.
   * @locus Client
   */
  Tracker.Dependency.prototype.changed = function () {
    set()
  };
  
  // http://docs.meteor.com/#dependency_hasdependents
  
  /**
   * @summary True if this Dependency has one or more dependent Computations, which would be invalidated if this Dependency were to change.
   * @locus Client
   * @returns {Boolean}
   */
  Tracker.Dependency.prototype.hasDependents = function () {
    // var self = this;
    // for(var id in self._dependentsById)
    //   return true;
    // return false;
  };

  Tracker.autorun = observe

  Tracker.afterFlush = function () {

  }

