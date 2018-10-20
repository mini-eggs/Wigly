export var component = tag => {
  var self = props => ({ tag, ...props });
  self["__fc__"] = true; // is functional component
  return self;
};
