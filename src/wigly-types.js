/**
 * @record
 */
function ComponentEnvironment() {}
/** @type {?} */
ComponentEnvironment.prototype.type;
/** @type {?} */
ComponentEnvironment.prototype.props;
/** @type {?} */
ComponentEnvironment.prototype.vars;
/** @type {?} */
ComponentEnvironment.prototype.childs;
/** @type {?} */
ComponentEnvironment.prototype.node;
/** @type {?} */
ComponentEnvironment.prototype.lastVDOM;
/** @type {?} */
ComponentEnvironment.prototype.effects;
/** @type {?} */
ComponentEnvironment.prototype.isActive;
/** @type {?} */
ComponentEnvironment.prototype.f;

/**
 * @record
 */
function InternalLifecycle() {}
/** @export @type {?} */
InternalLifecycle.prototype.oncreate;
/** @export @type {?} */
InternalLifecycle.prototype.onupdate;
/** @export @type {?} */
InternalLifecycle.prototype.onremove;
/** @export @type {?} */
InternalLifecycle.prototype.ondestroy;

/**
 * @record
 */
function VDOM() {}
/** @export @type {InternalLifecycle} */
VDOM.prototype.props;
/** @export @type {*} */
VDOM.prototype.element;

/**
 * @record
 */
function Effect() {}
/** @type {?} */
Effect.prototype.f;
/** @type {?} */
Effect.prototype.unique;
/** @type {?} */
Effect.prototype.last;
/** @type {?} */
Effect.prototype.cb;

/**
 * @record
 */
function ComponentProps() {}
/** @export @type {?} */
ComponentProps.prototype.key;

/**
 * @record
 */
function SubPromise() {}
/** @export @type {?} */
ComponentProps.prototype.then;
