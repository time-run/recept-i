/*
* Copyright 2020 Michael Böhm
* This file is part of recept-i
*/

(function (obj) {

  for (var prop in obj) {
    if( obj.hasOwnProperty( prop ) ) {

      if ( typeof module === "object" && module && typeof module.exports === "object" ) {
        module.exports = obj[prop];
      }else{
        Object.defineProperty(window, prop, {
          value : obj[prop],
          writable : false
        });
        if ( typeof define === "function" && define.amd ) {
            define( prop, [], function () { return obj[prop]; } );
        }
      }

    }
  }

})({
  isUndefined : function ( a ) {
    return void 0 === a
  },
  isNode : function ( o ){
    return !isUndefined(o) && ( typeof Node === "object" ? o instanceof Node : o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string" );
  },
  isElement : function ( o ) {
    return !isUndefined(o) && ( typeof HTMLElement === "object" ? o instanceof HTMLElement : o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string" );
  },
  isFunction : function ( a ) {
  	return !isUndefined(a) && "function" == typeof a
  },
  isNumber : function ( a ) {
  	return !isUndefined(a) && "number" == typeof a
  },
  isString : function ( a ) {
  	return !isUndefined(a) && "string" == typeof a
  },
  isObject : function ( a ) {
  	return !isUndefined(a) && "object" == typeof a && null !== a && undefined !== a
  },
  isArray : function ( a ) {
      return Array.isArray(a) || "[object Array]" === a
  },
  isBoolean : function ( a ) {
      return !isUndefined(a) && "boolean" === typeof a || isObject( a ) && "[object Boolean]" === b(a)
  },
  isNodeList : function (nodes) {
      var stringRepr = Object.prototype.toString.call(nodes);

      return !isUndefined(nodes) && typeof nodes === 'object' && /^\[object (HTMLCollection|NodeList|Object)\]$/.test(stringRepr) && (typeof nodes.length === 'number') && (nodes.length === 0 || (typeof nodes[0] === "object" && nodes[0].nodeType > 0));
  },
  get : function ( node, base ){

  	var el = null;
  	var base = !isUndefined( base ) ? ( isString( base ) ? only( base ) : base ) : document;

  	if( node && isString( "string" ) ){

  		if (/^\#/.test(node)) {
  			el = document.getElementById(node.slice(1)) || document.querySelector(node);
  		}else if( /^\./.test(node) ){
  			el = ( base.querySelectorAll(node) || base.getElementsByClassName(node.slice(1)) );
  		}else{
  			el = ( base.querySelectorAll(node) || base.getElementsByTagName(node) );
  		}

  	}

  	return el;

  },
  only : function ( node, base ){

    var el = get( node, base );
    return (isNodeList(el) || isArray(el)) ? el[ 0 ] : el;

  },
  node : function ( node, prop, child ){

  	if( !isUndefined( node ) ){

      var attr = {};
      if(isObject(prop))
        attr = prop;

      var id, classes = [];
      var patt = /(#|\.)[A-Za-z0-9_\-]+/g;

      node = node.replace( patt, function ( part ){
        if( /^\#/.test(part) )
          attr[ "id" ] = part.slice(1);

        if( /^\./.test(part) )
          attr[ "className" ] ? ( attr[ "className" ] += " " + part.slice(1) ) : attr[ "className" ] = part.slice(1);

        return "";
      } );


      var element = document.createElement( node );

      if(isString(prop))
        attr["innerHTML"] = prop;

      if(isObject(attr)){
        for( var prop in attr ){
  				if( attr.hasOwnProperty(prop) ){
  					isUndefined( element[prop] ) ? element.setAttribute(prop, attr[prop]) : ( element[prop] = attr[prop] );
  				}
  			}
      }

  		if( child ){
  			for( var i = 2; i < arguments.length; i++ ){
  				element.appendChild(arguments[i]);
  			}
  		}

  		return element;

  	}

  },
  css : function ( element, style ){

    if( !isObject( element ) || !isObject( style ) ){ return false; }

  	var i = 0;

  	if( Array.isArray( element ) || isNodeList( element ) ){

  		for( ; i < element.length; i++ ){
  			css( element[ i ], style );
  		}

  		return;
  	}

    var prop;
    for( prop in style )
      if( style.hasOwnProperty(prop) && (prop in element.style) )
        element.style[prop] = style[prop];

  },
  parse : function ( tag ) {
    return isString(tag) ? node("div", tag).firstChild : tag;
  },
  insert : function ( el, tag, before ) {
    var tag = parse(tag);
  	if(isElement(el) && isElement(tag)){
      return el.insertBefore( tag, before ? before : el.firstChild ), tag;
  	}
  	return false;
  },
  append : function ( el, tag ) {
    var tag = parse(tag);
    if(isElement(el) && isElement(tag)){
  	   return el.appendChild( tag ), tag;
  	}
  	return false;

  },
  html : function  ( el, tag ) {
    var tag = parse(tag);
    if(isElement(el)){
  	   return el.innerHTML = "", isElement(tag) && el.appendChild( tag ), tag;
  	}
  	return false;
  },
  addClick : function ( element, handler, capture ){

    if( !isFunction( handler ) ){ return false; }

    var type;
    if( 'onclick' in document.documentElement ){
      type = "click"
    }else{
        if( 'onmousedown' in document.documentElement )
          type = "mousedown"

        if( 'ontouchstart' in document.documentElement )
          type ? type += " touchstart" : type = "touchstart";
    }
  	addEvent( element, type, function fn (event) {

  		handler.apply( this, arguments );

  	}, capture || false );

  	return true;

  },
  addOnce : function ( element, type, handler, capture ){

  	if( isUndefined( type ) || !isFunction( handler ) ){ return false; }

  	addEvent( element, type, function fn (event) {

  		removeEvent( element, type, fn, capture || false );
  		handler.apply( this, arguments );

  	}, capture || false );

  	return true;

  },
  addEvent : function ( element, event, handler, capture ){

  	if( isUndefined( event ) || !isFunction( handler ) || !isObject( element ) ){ return false; }

  	var i = 0;

  	if( Array.isArray( element ) || isNodeList( element ) ){

  		for( ; i < element.length; i++ ){
  			addEvent( element[ i ], event, handler, capture );
  		}

  		return;
  	}

  	event = event.split(" ");

  	for( ; i < event.length; i++ ){

  		if( isFunction( element.addEventListener ) ){

  			element.addEventListener( event[ i ], handler, capture || false );

  		}else if( element.attachEvent ){

  			element.attachEvent( "on" + event[ i ], handler );

  		}

  	}

  	return true;

  },
  removeEvent : function ( element, event, handler, capture ) {

  	if( isUndefined( event ) || !isFunction( handler ) || !isObject( element ) ){ return false; }

  	var i = 0;

  	if( Array.isArray( element ) || isNodeList( element ) ){

  		for( ; i < element.length; i++ ){
  			removeEvent( element[ i ], event, handler, capture );
  		}

  		return;
  	}

  	event = event.split(" ");

  	for( ; i < event.length; i++ ){

  		if( isFunction( element.removeEventListener ) ){

  			element.removeEventListener( event[ i ], handler, capture || false );

  		}else if( element.detachEvent ){

  			element.detachEvent( "on" + event[ i ], handler );

  		}

  	}

  	return true;

  },
  hasClass : function ( element, name ){

  	if( !isElement(element) || !isString(name) ){return false;}
  	return ( !element.className || (element.className.indexOf(name.toString()) == -1) ) ? false : true;

  },
  addClass : function (element, name){

    if( isUndefined( element ) || isUndefined( name ) ){ return false; }

  	var i = 0;

  	if( Array.isArray( element ) || isNodeList( element ) ){

  		for( ; i < element.length; i++ ){
  			addClass( element[ i ], name );
  		}

  		return;
  	}

  	return ( !hasClass( element, name ) ) ? ( element.className += ( element.className ? ' ' : '' ) + name, element ) : false;

  },
  removeClass : function (element, name){

    if( isUndefined( element ) || isUndefined( name ) ){ return false; }

    var i = 0;

    if( Array.isArray( element ) || isNodeList( element ) ){

      for( ; i < element.length; i++ ){
        removeClass( element[ i ], name );
      }

      return;
    }

  	return ( element.className = element.className.replace( new RegExp( '(?:^|\\s)' + name + '(?!\\S)', 'gi' ), "" ) ), element;

  },
  toggleClass : function ( element, name ){

    if( isUndefined( element ) || isUndefined( name ) ){ return false; }

    var i = 0;

    if( Array.isArray( element ) || isNodeList( element ) ){

      for( ; i < element.length; i++ ){
        toggleClass( element[ i ], name );
      }

      return;
    }

  	hasClass(element, name) ? removeClass(element, name) : addClass(element, name);

  },
  cookie : function ( name, value, days, path ) {
  	if( !name )
      return false;

  	if( !value ){

  		return ( function (){

  			for(var i = 0, data = document.cookie.split('; '), len = data.length, cookie; i < len; i++ ){
  				if( cookie = data[ i ].split( "=" ), cookie[ 0 ] === name ){
  					return cookie[ 1 ];
  				}
  			}
  			return false;

  		} )();
  	}

  	var time = ( function () {
  		if( days === void 0 ){ return; }
  		var date = new Date();
  		date.setTime( date.getTime() + ( days * 864e5 ) );
  		return date.toUTCString();
  	} )();

  	return document.cookie = [ name, "=", value, ( days !== void 0 ? "; expires=" + time : "" ), "; path=", ( path !== void 0 ? path : "/" ) ].join("");

  },
  mergeObj : function ( source, target ) {

    if( isObject( source ) && isObject( target ) ){

      Object.keys( source ).forEach( function (key) {

        if( target[ key ] ){
          if( isObject( source[ key ] ) && isObject( target[ key ] ) ){
            mergeObj( source[ key ], target[ key ] )
          }
        }else{
          target[ key ] = source[ key ];
        }

      } );

    }

    return target;

  },
  log : function ( message ){
    if( window.console && console.log )
      console.log(message);
  },
  warn : function ( message ){
    if( window.console && console.warn )
      console.warn(message);
  },
  error : function ( message, file, line ){
    try {
      throw new Error(message, file, line);
    } catch (e) {
      log(e.name + ': ' + e.message);
    }
  },
  forEach : function (list, callback, thisArg) {

  	var T, k;

  	if (list === null) {
  		throw new TypeError(' this is null or not defined');
  	}

  	var O = Object(list);
  	var len = O.length >>> 0;

  	if (typeof callback !== "function") {
  		throw new TypeError(callback + ' is not a function');
  	}

  	if (arguments.length > 1) {
  		T = thisArg;
  	}

  	k = 0;

  	while (k < len) {

  		var kValue;

  		if (k in O) {

  			kValue = O[k];
  			callback.call(T, kValue, k, O);
  		}
  		k++;
  	}

  },
  wait : function ( callback, time ){
    if(isFunction(callback) && isNumber(time)){
      return setTimeout( function () {callback();}, time );
    }
  },
  repeatString : function ( string, num ){
      return new Array( num + 1 ).join( string );
  },
  offset : function ( element, reference ){
  	var x = 0, y = 0;
  	while( element && !isNaN( element.offsetLeft ) && !isNaN( element.offsetTop ) && ( element !== reference ) ){
  		x += element.offsetLeft - element.scrollLeft;
  		y += element.offsetTop - element.scrollTop;
  		element = element.offsetParent;
  	}
  	return { top : y, left : x };
  },
  attr : function ( element, attr, NS ) {

    if( !isElement(element) )
      return false;

    if( isString( attr ) )
      return element.getAttribute( attr ) || "";


  	for( var prop in attr ){
  		if( attr.hasOwnProperty(prop) ){
        if(!NS){
          isUndefined( element[prop] ) ? element.setAttribute(prop, attr[prop]) : ( element[prop] = attr[prop] );
          continue;
        }

        element.setAttributeNS(null, prop, attr[prop]);
  		}
  	}

    return element;

  },
  ajax : function ( method, url, callback, sync, data ){

  	if( /^(POST|GET)$/.test( method ) && url ){

  		callback = callback || function () {};
  		sync = sync || false;
  		async = !sync;
  		data = data || {};

  		var x = ( function () {

  			if( typeof XMLHttpRequest !== 'undefined' ){
  				return new XMLHttpRequest();
  			}

  			var versions = "MSXML2.XmlHttp.6.0 MSXML2.XmlHttp.5.0 MSXML2.XmlHttp.4.0 MSXML2.XmlHttp.3.0 MSXML2.XmlHttp.2.0 Microsoft.XmlHttp".split(" ");
  			var ActiveX;

  			for( var i = 0; i < versions.length; i++ ){
  				try{
  					ActiveX = new ActiveXObject( versions[i] );
  					break;
  				}catch( e ){}
  			}

  			return ActiveX;

  		} )();

  		if( !x ){ return false; }

  		x.open( method, url, async );
  		x.onreadystatechange = function () {
  			callback( x.responseText, x.readyState, x.status );
  		};
  		x.onerror = function () {
  			callback( x.responseText, x.readyState, "error" );
  		};

  		if( method === "POST" ){
  			x.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded' );
  		}

  		var query = [];
  		for( var key in data ){
  			query.push( encodeURIComponent( key ) + '=' + encodeURIComponent( data[key] ) );
  		}

  		x.send( query.join( "&" ) );

  	}
  },
  truncateText : function (text, sentCount = 3, moreText = "") {
    var sentences = text.match(/[^\.!\?]+[\.!\?]+/g);
    if (sentences) {
      if (sentences.length >= sentCount && sentences.length > sentCount) {
        return sentences.slice(0, sentCount).join(" ") + moreText;
      }
    }
    return text;
  },
  toQuery : function (obj) {
    query = [];
    for( var key in obj )
      query.push( encodeURIComponent( key ) + '=' + encodeURIComponent( obj[key] ) );
    return query.join( "&" );
  }
});
