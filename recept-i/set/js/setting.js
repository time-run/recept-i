/*
* Copyright 2020 Michael Böhm
* This file is part of recept-i
*/
function Setting (_parent) {
  this.parent = _parent;
  this.elements = []
}

Setting.prototype.createSwitchRow  = function (name, options, initial) {
  var wrapper = {
    name : name,
    self : append(this.parent, '<div class="module-row module-switchrow"></div>'),
    elements : {},
    initial : initial,
    value : initial
  };
  options.forEach((option) => {
    wrapper.elements[option] = this.createSwitchItem(option, option == initial, (value) => {wrapper.show(wrapper.value = value)}, wrapper.self);
  });

  wrapper.show = function () {
    for(var key in wrapper.elements)
      wrapper.elements[key].show(wrapper.elements[key].name == wrapper.value);
  }
  this.elements.push(wrapper);
}

Setting.prototype.createSwitchItem  = function (name, initial, fn, parent) {
  var item = {
    name : name,
    self : append(parent || this.parent, node('div.module-switcher', name)),
    initial : initial,
    value : initial
  };
  item.show = function (value) {(item.value = value) ? addClass(item.self, 'active') : removeClass(item.self, 'active')}
  item.show(initial);
  addClick(item.self, function (e) {return this.show(!this.value), fn && fn(this.name)}.bind(item));

  return fn ? item : this.elements.push(item);
}

Setting.prototype.reset = function () {
  this.elements.forEach((element) => {element.show(element.value = element.initial)});

  return this;
}

Setting.prototype.save = function () {
  this.elements.forEach((element) => {element.initial = element.value});

  return this;
}

Setting.prototype.get = function () {
  var values = {}
  this.elements.forEach((element) => {values[element.name] = element.value});

  return values;
}
