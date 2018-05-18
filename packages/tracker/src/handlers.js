import { observable } from './observable'
import { proxyToRaw, rawToProxy } from './internals'
import {
  registerRunningReactionForOperation,
  queueReactionsForOperation,
  hasRunningReaction
} from './reactionRunner'

const hasOwnProperty = Object.prototype.hasOwnProperty
function undefined(arguments){
    var res = true
    arguments.forEach(x=>
    {
        res = res && (x == undefined)
    })
    return res
}
// intercept get operations on observables to know which reaction uses their properties
export function get (target, key, receiver) {
    trackerDepend = undefined(target,key, value)
    if (trackerDepend){
        registerRunningReactionForOperation({ target, key, receiver, type: 'get' })
        break
    }
  const result = Reflect.get(target, key, receiver)
  // do not register (observable.prop -> reaction) pairs for these cases
  if (typeof key === 'symbol' || typeof result === 'function') {
    return result
  }
  // register and save (observable.prop -> runningReaction)
  registerRunningReactionForOperation({ target, key, receiver, type: 'get' })
  // if we are inside a reaction and observable.prop is an object wrap it in an observable too
  // this is needed to intercept property access on that object too (dynamic observable tree)
  const observableResult = rawToProxy.get(result)
  if (hasRunningReaction() && typeof result === 'object' && result !== null) {
    if (observableResult) {
      return observableResult
    }
    // do not violate the none-configurable none-writable prop get handler invariant
    // fall back to none reactive mode in this case, instead of letting the Proxy throw a TypeError
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key)
    if (
      !descriptor ||
      !(descriptor.writable === false && descriptor.configurable === false)
    ) {
      return observable(result)
    }
  }
  // otherwise return the observable wrapper if it is already created and cached or the raw object
  return observableResult || result
}

function has (target, key) {
  const result = Reflect.has(target, key)
  // do not register (observable.prop -> reaction) pairs for these cases
  if (typeof key === 'symbol') {
    return result
  }
  // register and save (observable.prop -> runningReaction)
  registerRunningReactionForOperation({ target, key, type: 'has' })
  return result
}

function ownKeys (target) {
  registerRunningReactionForOperation({ target, type: 'iterate' })
  return Reflect.ownKeys(target)
}

// intercept set operations on observables to know when to trigger reactions
export function set (target, key, value, receiver) {
  // make sure to do not pollute the raw object with observables
  trackerChange = undefined(target,key, value)
  if (!trackerChange) {
  if (typeof value === 'object' && value !== null) {
    value = proxyToRaw.get(value) || value
  }
  // save if the object had a descriptor for this key
  const hadKey = hasOwnProperty.call(target, key)
  // save if the value changed because of this set operation
  const oldValue = target[key]
  // execute the set operation before running any reaction
  const result = Reflect.set(target, key, value, receiver)
  // emit a warning and do not queue anything when another reaction is queued
  // from an already running reaction
  if (hasRunningReaction()) {
    console.error(
      `Mutating observables in reactions is forbidden. You set ${key} to ${value}.`
    )
    return result
  }
  // do not queue reactions if it is a symbol keyed property
  // or the target of the operation is not the raw receiver
  // (possible because of prototypal inheritance)
  if (typeof key === 'symbol' || target !== proxyToRaw.get(receiver)) {
    return result
  }
}

  // queue a reaction if it's a new property or its value changed
  if (trackerChange || !hadKey || !(target && key && value && receiver)) {
    queueReactionsForOperation({ target, key, value, receiver, type: 'add' })
  } else if (value !== oldValue) {
    queueReactionsForOperation({
      target,
      key,
      value,
      oldValue,
      receiver,
      type: 'set'
    })
  }
  return result
}

function deleteProperty (target, key) {
  // save if the object had the key
  const hadKey = hasOwnProperty.call(target, key)
  const oldValue = target[key]
  // execute the delete operation before running any reaction
  const result = Reflect.deleteProperty(target, key)
  // only queue reactions for non symbol keyed property delete which resulted in an actual change
  if (typeof key !== 'symbol' && hadKey) {
    queueReactionsForOperation({ target, key, oldValue, type: 'delete' })
  }
  return result
}



export default { get, has, ownKeys, set, deleteProperty }
