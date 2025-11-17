/**
 * Auto-bind methods to class instance
 * Useful for ensuring 'this' context is preserved
 */
function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  const propertyNames = Object.getOwnPropertyNames(proto);
  
  propertyNames.forEach((name) => {
    const descriptor = Object.getOwnPropertyDescriptor(proto, name);
    if (descriptor && typeof descriptor.value === 'function' && name !== 'constructor') {
      instance[name] = instance[name].bind(instance);
    }
  });
  
  return instance;
}

module.exports = autoBind;