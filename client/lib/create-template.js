let templates = {};

module.exports = function(selector) {
  if (!templates[selector]) {
    let html = document.querySelector('#template-' + selector).innerHTML ;
      templates[selector] = Handlebars.compile(html);  
  }
  return templates[selector];
};
