import {
    runAsReaction
} from './reactionRunner'
import {
    releaseReaction
} from './store'

export const IS_REACTION = Symbol('is reaction')
var withNoYieldsAllowed = function (f) {
    if ((typeof Meteor === 'undefined') || Meteor.isClient) {
        return f;
    } else {
        return function () {
            var args = arguments;
            Meteor._noYieldsAllowed(function () {
                f.apply(null, args);
            });
        };
    }
}

export function observe(fn, options = {}) {
    // wrap the passed function in a reaction, if it is not already one
    const reaction = fn[IS_REACTION] ?
        fn :
        function reaction() {
            return runAsReaction(reaction, fn, this, arguments)
        }
    // save the scheduler and debugger on the reaction
    reaction.scheduler = options.scheduler
    reaction.debugger = options.debugger
    reaction.stopped = false
    reaction.invalidated = false
    reaction.firstRun = false
    reaction._func = fn
    reaction._recomputing = false
    reaction._onInvalidateCallbacks = [];
    reaction._onStopCallbacks = [];
    reaction.onInvalidate = function (f) {
        var self = reaction;

        if (typeof f !== 'function')
            throw new Error("onInvalidate requires a function");

        if (self.invalidated) {
            Tracker.nonreactive(function () {
                withNoYieldsAllowed(f)(self);
            });
        } else {
            self._onInvalidateCallbacks.push(f);
        }
    };
    reaction.onStop = function (f) {
        var self = reaction;

        if (typeof f !== 'function')
            throw new Error("onStop requires a function");

        if (self.stopped) {
            Tracker.nonreactive(function () {
                withNoYieldsAllowed(f)(self);
            });
        } else {
            self._onStopCallbacks.push(f);
        }
    };
    reaction.stop = () => {
        var self = reaction;

        if (!self.stopped) {
            self.stopped = true;
            self.invalidated = true
            for (var i = 0, f; f = self._onInvalidateCallbacks[i]; i++) {
                Tracker.nonreactive(function () {
                    withNoYieldsAllowed(f)(self);
                });
            }
            self._onInvalidateCallbacks = [];
            for (var i = 0, f; f = self._onStopCallbacks[i]; i++) {
                Tracker.nonreactive(function () {
                    withNoYieldsAllowed(f)(self);
                });
            }
            self._onStopCallbacks = [];
        }
    }

    // save the fact that this is a reaction
    reaction[IS_REACTION] = true
    // run the reaction once if it is not a lazy one
    if (!options.lazy) {
        reaction()
    }
    return reaction
}

export function unobserve(reaction) {
    // do nothing, if the reaction is already unobserved
    if (!reaction.unobserved) {
        // indicate that the reaction should not be triggered any more
        reaction.unobserved = true
        // release (obj -> key -> reaction) connections
        releaseReaction(reaction)
    }
    // unschedule the reaction, if it is scheduled
    if (typeof reaction.scheduler === 'object') {
        reaction.scheduler.delete(reaction)
    }
}
