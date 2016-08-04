export function objectToFormData(obj, form, namespace) {
  var fd = form || new FormData();
  var formKey;
  
  for(var property in obj) {
    if(obj.hasOwnProperty(property)) {
      
      if(namespace !== undefined) {
        formKey = namespace + '[' + property + ']';
      } else {
        formKey = property;
      }
     
      // if the property is an object, but not a File,
      // use recursivity.
      if(typeof obj[property] === 'object' && !(obj[property] instanceof File)) {
        
        objectToFormData(obj[property], fd, formKey);
        
      } else {
        // if it'startsWith('_')s a string or a File object
        if(!formKey.startsWith('_'))
            fd.append(formKey, obj[property]);
      }
      
    }
  }
  
  return fd;
};
