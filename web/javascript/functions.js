/**
 *  Convert a timestamp (in milliseconds) into a date
 *  @param timestamp
 */
function timestamp_to_date(timestamp){
  var date = new Date(timestamp);

  var hours = date.getHours();
  var minutes = "0" + date.getMinutes();
  var seconds = "0" + date.getSeconds();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();

  // Will display time in 10:30:23 format
  return year + "-" + month + "-" + day + " " +hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}

/**
 * Return true if table has no value
 */
function is_empty_table(table){
  for (var key in table) {
    if (hasOwnProperty.call(table, key)) return false;
  }
  return true;
}

/**
 * displays content of a json object contaning an error
 * @param error_response json object
 */
function get_error_message(error_response){
  console.log(error_response);
  var error_object = JSON.parse( error_response );
  return "An error occurred :  " + error_object.error;
}

/**
*  search into a list an object where the given property has a given value
*  return null if not found
*  @param   object_list   a list of objects
*  @param   property      the searched property
*  @param   value         the searched value
*/
function search_object_in_list(object_list, property, value){
  for(var key in object_list){
    if(object_list[key][property] !== undefined && object_list[key][property] === value){
      return object_list[key];
    }
  }
  return null;
}

/**
* Search and return value of a property in an object, if it exists
* @param propertyName name pf property
* @param dataSource   object contaning the property
*/
function get_property_in_object(propertyName, dataSource){
  if( dataSource[propertyName] !== undefined && dataSource[propertyName] !== ""){
    return dataSource[propertyName];
  }

  return "not available";
}

function get_url_parameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

/**
 * return true if a request has a get call, meaning data have been downloaded
 * @param data_row  json object
 */
function hasGet(data_row){
  for(var i = 0 ;i < data_row["queryInvocationDetails"].length; i++){
    if(is_get(data_row["queryInvocationDetails"][i]))
      return true;
  }
  return false;
}

function is_get(invocation){
  if(invocation['queryToken'].toLowerCase().endsWith(':get'))
    return true;  
  return false;
}

/* Add filter function to array 
*  whatever browser is used
**/
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun/*, thisArg*/) {
    'use strict';

    if (this === void 0 || this === null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== 'function') {
      throw new TypeError();
    }

    var res = [];
    var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
    for (var i = 0; i < len; i++) {
      if (i in t) {
        var val = t[i];

        // NOTE: Technically this should Object.defineProperty at
        //       the next index, as push can be affected by
        //       properties on Object.prototype and Array.prototype.
        //       But that method's new, and collisions should be
        //       rare, so use the more-compatible alternative.
        if (fun.call(thisArg, val, i, t)) {
          res.push(val);
        }
      }
    }

    return res;
  };
}
