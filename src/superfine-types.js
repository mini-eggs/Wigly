/**
 * @record
 */
function SuperFineElement() {}
/** @export @type {?Array<Function>} */
SuperFineElement.prototype.events;
/** @export @type {?} */
SuperFineElement.prototype.nodeValue;

/**
 * @record
 */
function SuperFineEvent() {}
/** @export @type {?SuperFineElement} */
SuperFineEvent.prototype.currentTarget;
/** @export @type {?} */
SuperFineEvent.prototype.type;

/**
 * @record
 */
function SuperFineProps() {}
/** @export @type {?} */
SuperFineProps.prototype.key;
/** @type {?Array<SuperFineNode>} */
SuperFineProps.prototype.children;
/** @export @type {?Function} */
SuperFineProps.prototype.oncreate;
/** @export @type {?Function} */
SuperFineProps.prototype.onupdate;
/** @export @type {?Function} */
SuperFineProps.prototype.onremove;
/** @export @type {?Function} */
SuperFineProps.prototype.ondestroy;

/**
 * @record
 */
function SuperFineNode() {}
/** @type {?number} */
SuperFineNode.prototype.type;
/** @type {?string} */
SuperFineNode.prototype.name;
/** @type {?SuperFineProps} */
SuperFineNode.prototype.props;
/** @type {?Array<SuperFineNode>} */
SuperFineNode.prototype.children;
/** @type {?SuperFineElement} */
SuperFineNode.prototype.element;
