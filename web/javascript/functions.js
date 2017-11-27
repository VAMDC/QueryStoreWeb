var StoreUtilities = (function(){  
  return{
    isGet : function(invocation){
      if(invocation['queryToken'].toLowerCase().endsWith(':get'))
        return true;  
      return false;
    },

     /**
     *  Convert a timestamp (in milliseconds) into a date
     *  @param timestamp
     */
    timestampToDate : function(timestamp){
      var date = new Date(timestamp);

      var hours = date.getHours();
      var minutes = "0" + date.getMinutes();
      var seconds = "0" + date.getSeconds();
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();

      // Will display time in 10:30:23 format
      return year + "-" + month + "-" + day + " " +hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
    },
    
    /**
    * Return true if table has no value
    */
    isEmptyTable : function(table){
      for (var key in table) {
        if (hasOwnProperty.call(table, key)) return false;
      }
      return true;
    },
    
    /**
    * displays content of a json object containing an error
    * @param error_response json object
    */
    getErrorMessage : function(error_response){
      console.log(error_response);
      var error_object = JSON.parse( error_response );
      return "An error occurred :  " + error_object.error;
    },
    
    /**
    * Search and return value of a property in an object, if it exists
    * @param propertyName name pf property
    * @param dataSource   object contaning the property
    */
    getPropertyInObject : function(propertyName, dataSource){
      if( dataSource[propertyName] !== undefined && dataSource[propertyName] !== ""){
        return dataSource[propertyName];
      }

      return "not available";
    },
    
    /**
    * return true if a request has a get call, meaning data have been downloaded
    * @param data_row  json object
    */
    hasGet : function(data_row){
      for(var i = 0 ;i < data_row["queryInvocationDetails"].length; i++){
        if(StoreUtilities.isGet(data_row["queryInvocationDetails"][i]))
          return true;
      }
      return false;
    },
    
    registry : (function(){
      var self = {};
      var local_registry = {
          'http://vald.astro.uu.se/atoms-12.07/tap/' : { 'name': 'VALD (atoms)' },
          'http://sesam.obspm.fr/12.07/vamdc/tap/' : { 'name' : 'SpEctroScopy of Atoms and Molecules' },
          'http://stark-b.obspm.fr/12.07/vamdc/tap/' :  { 'name' : 'Stark-b' },
          'http://tipbase.obspm.fr/12.07/vamdc/tap/' : { 'name' : 'TIPbase : VAMDC-TAP interface' },
          'http://topbase.obspm.fr/12.07/vamdc/tap/' :  { 'name' : 'TOPbase : VAMDC-TAP interface' },
          'http://basecol2015.vamdc.org/12_07/' : { 'name' : 'Basecol 2015 (dev)' }
      };

      self.getLocalRegistry = function(){
          return local_registry;
      }
      
      self.getNodeName = function(node_url){
        return local_registry[node_url]['name'];
      }
      
      self.getNodeUrl = function(node_name){
        for(node_url in local_registry){
          if(self.getNodeName(node_url) === node_name){
            return node_url;
          }
        }
        return '';
      }    
      return self;
      
    })(),

    getUrlParameter : function(sParam) {
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
  };
})();

