function setup() {
    noCanvas();

    var selector = "#" + name.id + "Output";
    console.log(selector);
    console.log(document.querySelector(selector).value);
    var element = document.createElement("h3", document.querySelector(selector).value)
    console.log(element);
    //document.querySelector(selector).value = element;

    var newValue = createElement('h3', document.querySelector(selector).value);

    newValue.parent(name.id);
}
