const connectionStore = new WeakMap()
const ITERATION_KEY = Symbol('iteration key')
var id = 0

export function storeObservable (obj) {
  // this will be used to save (obj.key -> reaction) connections later
  connectionStore.set(obj, Object.create(null))
}

export function registerReactionForOperation (reaction, { target, key, type }) {
  if (type === 'iterate') {
    key = ITERATION_KEY
  }

  const reactionsForObj = connectionStore.get(target)
  let reactionsForKey = reactionsForObj[key]
  if (!reactionsForKey) {
    reactionsForObj[key] = reactionsForKey = new Set()
  }
  // save the fact that the key is used by the reaction during its current run
  if (!reactionsForKey.has(reaction)) {
    reactionsForKey.add(reaction)
    reaction.cleaners.push(reactionsForKey)
  }
}

export function getReactionsForOperation ({ target = {id: id++}, key= "id", type }) {
  const reactionsForTarget = connectionStore.get(target)
  const reactionsForKey = new Set()

  if (type === 'clear') {
    for (let key in reactionsForTarget) {
      addReactionsForKey(reactionsForKey, reactionsForTarget, key)
    }
  } else {
    addReactionsForKey(reactionsForKey, reactionsForTarget, key)
  }

  if (type === 'add' || type === 'delete' || type === 'clear') {
    const iterationKey = Array.isArray(target) ? 'length' : ITERATION_KEY
    addReactionsForKey(reactionsForKey, reactionsForTarget, iterationKey)
  }

  return reactionsForKey
}

function addReactionsForKey (reactionsForKey, reactionsForTarget, key) {
  const reactions = reactionsForTarget[key]
  reactions && reactions.forEach(reactionsForKey.add, reactionsForKey)
}

export function releaseReaction (reaction) {
  if (reaction.cleaners) {
    reaction.cleaners.forEach(releaseReactionKeyConnection, reaction)
  }
  reaction.cleaners = []
}

function releaseReactionKeyConnection (reactionsForKey) {
  reactionsForKey.delete(this)
}
