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
          'http://dev.vamdc.org/basecol/tapservice_12_07/' : { 'name' : 'BASECOL: VAMDC-TAP interface', 'ivo_id': 'ivo://vamdc/basecol/vamdc-tap_12.07' },
          'http://servo.aob.rs/emol/tap' : {'name' : 'Belgrade electron/atom(molecule) database (BEAMDB)', 'ivo_id': 'ivo://vamdc/emol_radam'},
          'http://lts.iao.ru/node/cdsd-1000-xsams1/tap/' : {'name' : 'Carbon Dioxide Spectroscopic Databank 1000K (VAMDC-TAP)', 'ivo_id': 'ivo://vamdc/cdsd-1000'},
          'http://lts.iao.ru/node/cdsd-296-xsams1/tap/' : {'name' : 'Carbon Dioxide Spectroscopic Databank 296K (VAMDC-TAP)', 'ivo_id': 'ivo://vamdc/cdsd-296'},
          'http://cdms.ph1.uni-koeln.de/cdms/tap/' : {'name' : 'CDMS', 'ivo_id': 'ivo://vamdc/cdms/vamdc-tap_12.07'},
          'http://vamdc.ast.cam.ac.uk/chianti7/tap/' : {'name' : 'Chianti', 'ivo_id': 'ivo://vamdc/chianti/django'},
          'http://vamdc.univ-reims.fr/ecasda-12.07/tap/' : { 'name' : 'ECaSDa - Ethene Calculated Spectroscopic Database', 'ivo_id':'ivo://vamdc/reims-ethylene' },
          'http://vamdc.icb.cnrs.fr/gecasda/tap/' : { 'name' : 'GeCaSDa: Gemane Calculated Spectroscopic Database', 'ivo_id':'ivo://vamdc/dijon-GeH4-lines' },
          'http://vamdc.univ-reims.fr/smpo12/tap/' : {'name' : 'GSMA Reims S&MPO', 'ivo_id': 'ivo://vamdc/smpo-sample'},
          'http://cdms.ph1.uni-koeln.de/jpl/tap/' : {'name' : 'JPL database: VAMDC-TAP service', 'ivo_id': 'ivo://vamdc/JPLdev'},
          'http://kida-vamdc.obs.u-bordeaux1.fr/node/KIDA/tap/' : {'name' : 'KIDA: Kinetic Database for Astrochemistry - TAP service', 'ivo_id': 'ivo://vamdc/kida/vamdc-tap_12.07'},
          'http://vamdc.lxcat.net/tap/' : {'name' : 'LXcat', 'ivo_id': 'ivo://vamdc/lxcat'},
          'http://vamdc.icb.cnrs.fr/mecasda-12.07/tap/' : { 'name' : 'MeCaSDa - Methane Calculated Spectroscopic Database', 'ivo_id':'ivo://vamdc/dijon-methane-lines' },
          'http://dblasp.oact.inaf.it/node1207/OACT/tap/' : {'name' : 'OACT - LASP Database', 'ivo_id': 'ivo://vamdc/OACatania/LASP'},
          'http://servo.aob.rs/mold/tap/' : {'name' : 'Photodissociation - MolD database', 'ivo_id': 'ivo://vamdc/MolD'},
          'http://vamdc.icb.cnrs.fr/rucasda/tap/' : { 'name' : 'RuCaSDa: Ruthenium tetroxide Calculated Spectroscopic Database', 'ivo_id':'ivo://vamdc/dijon-RuO4-lines' },
          'http://vamdc.icb.cnrs.fr/shecasda/tap/' : { 'name' : '	SHeCaSDa - SF6 Calculated Spectroscopic Database', 'ivo_id':'ivo://vamdc/dijon-SF6-lines' },
          'http://sesam.obspm.fr/12.07/vamdc/tap/' : { 'name' : 'SpEctroScopy of Atoms and Molecules', 'ivo_id':'ivo://vamdc/sesam/tap-xsams' },
          'http://stark-b.obspm.fr/12.07/vamdc/tap/' :  { 'name' : 'Stark-b' , 'ivo_id':'ivo://vamdc/stark-b/tap-xsams'},
          'http://vamdc.icb.cnrs.fr/tfmecasda/tap/' : { 'name' : 'TFMeCaSDa - CF4 Calculated Spectroscopic Database', 'ivo_id':'ivo://vamdc/dijon-CF4-lines' },
          'http://vamdc-pah.oa-cagliari.inaf.it/tap/' :  { 'name' : 'Theoretical spectral database of polycyclic aromatic hydrocarbons' , 'ivo_id':'ivo://vamdc/OA-Cagliari/PAH'},
          'http://tipbase.obspm.fr/12.07/vamdc/tap/' : { 'name' : 'TIPbase : VAMDC-TAP interface', 'ivo_id':'ivo://vamdc/TIPbase/tap-xsams' },
          'http://topbase.obspm.fr/12.07/vamdc/tap/' :  { 'name' : 'TOPbase : VAMDC-TAP interface', 'ivo_id':'ivo://vamdc/TOPbase/tap-xsams' },
          'http://star.pst.qub.ac.uk/sne/umist3/tap/' :  { 'name' : 'UMIST Database for Astrochemistry', 'ivo_id':'ivo://vamdc/UDFA' },          
          'http://vald.astro.uu.se/atoms-12.07/tap/' : { 'name': 'VALD (atoms)', 'ivo_id':'ivo://vamdc/vald/uu/django' },  
          'http://vald.inasan.ru/vald-node/tap/' : { 'name': 'VALD sub-set in Moscow (obs)', 'ivo_id':'ivo://vamdc/vald-Moscow' },
          'http://vamdc.saga.iao.ru/node/wadis/tap/' : { 'name': 'Water internet Accessible Distributed Information System', 'ivo_id':'ivo://vamdc/wadis/vamdc-tap' },      
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

