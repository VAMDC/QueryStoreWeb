// main.js
var React = require('react');
var ReactDOM = require('react-dom');
var $ = require("jquery");
var classNames = require('classnames');
var moment = require('moment');
var Datetime = require('react-datetime');
var parse = require("bibtex-parser");

/**
 * Return an object containing reference information by reading data
 * @param data map returned by web service
 */
function get_reference(data){  
  var reference = new Object();    
  reference.datasource = data['accededResource'] !== undefined ? data['accededResource'] : '';
  reference.resourceversion = data['resourceVersion']!== undefined ? data['resourceVersion'] : '';
  reference.bibtex = data['biblioGraphicReferences']!== undefined ? data['biblioGraphicReferences'] : '';
  reference.xsams = data["dataURL"]!== undefined ? data['dataURL'] : '';
  reference.uuid = data['UUID']!== undefined ? data['UUID'] : '';
  reference.query = data['parameters'] !== undefined ? data['parameters'][0].replace('query=', '').replace(';', '') : '';
  reference.timestamps = data["queryInvocationDetails"]!== undefined ? data['queryInvocationDetails'] : '';
  reference.outputformatversion = data['outputFormatVersion']!== undefined ? data['outputFormatVersion'] : '';
  return reference;
}

/**
 * Return an object containing error informations returned by web service after a failed request 
 * @param data map returned by web service
 */
function get_error_info(data){
  
  var error = new Object();
  error.phase = data["phase"] !== undefined ? data["phase"] : '';
  error.errorMessage = data["errorMessage"]!== undefined ? data["errorMessage"] : '';
	error.uuid = data["UUID"]!== undefined ? data["UUID"] : '';
	error.queryToken = data["queryToken"]!== undefined ? data["queryToken"] : '';
	error.parameters = data["parameters"]!== undefined ? data["parameters"] : '';
	error.timestamp = data["timestamp"]!== undefined ? data["timestamp"] : '';  
  return error;
}


/**
 * Displays text in a paragraph
 * @param text
 */
function MessageBox(props){
  const text = props.text;
  return (
    <p>{text}</p>
  );
};


/**
 * @param content        div content
 * @param contentName    content name in button text
 */
var HiddableDiv = React.createClass({
  getInitialState : function() {
    return {
      visibilityClass : "hidden",
      buttonText : "Show",
    };
  },

  switchVisibility : function(){
    if(this.state.visibilityClass === "hidden"){
      this.setState({visibilityClass : "visible", buttonText:"Hide"})
    }else{
      this.setState({visibilityClass : "hidden", buttonText:"Show"})
    }
  },

  render : function(){
    return (
      <div className="hiddable-div">
        <p>
          <button onClick={this.switchVisibility}>
            {this.state.buttonText} {this.props.contentName}
          </button>
        </p>
        <div className={this.state.visibilityClass}>
          {this.props.content}
        </div>
      </div>
    );
  }

});

/**
 * @param error     contain reference data of a request
 *
 */
var QueryErrorBox = React.createClass({ 

  getVisibility : function(){    
    if(this.props.error.uuid === ''){
      return "hidden";
    }  
    
    return "visible";
  },
  
  render : function(){  
    return (
      <div className={this.getVisibility()}>        
        <div>
          <p>
            <strong> We are sorry, there was a problem with this request. </strong> 
          </p>
          <p>
            <strong>Error message </strong> : {this.props.error.errorMessage}
          </p>
          <p>
            <strong>Request UUID </strong> : {this.props.error.uuid}
          </p>
          <p>
            <strong>Request parameters </strong> : {this.props.error.parameters}
          </p>
        </div>
      </div>
    );    
  }
});

/**
 * @param reference     contain reference data of a request
 *
 */
var QueryDetailBox = React.createClass({

 /**
 *  Return html formatted bibtex
 */
  getBibtex : function(){
    var result = [];
    try{
      var bibtex = parse(this.props.reference.bibtex);
      var i = 1;

      for (var k in bibtex) {
        if( StoreUtilities.getPropertyInObject("TITLE", bibtex[k]) !== "not available" &&
            StoreUtilities.getPropertyInObject("JOURNAL", bibtex[k]) !== "not available"){
          result.push(
            <ul key={i}>
                <li><span className="underline">Title</span> : {StoreUtilities.getPropertyInObject("TITLE", bibtex[k])}</li>
                <li><span className="underline">Journal</span> : {StoreUtilities.getPropertyInObject("JOURNAL", bibtex[k])}</li>
                <li><span className="underline">Authors</span> : {StoreUtilities.getPropertyInObject("AUTHOR", bibtex[k])}</li>
                <li><span className="underline">Pages</span> : {StoreUtilities.getPropertyInObject("PAGES", bibtex[k])}</li>
                <li><span className="underline">Volume</span> : {StoreUtilities.getPropertyInObject("VOLUME", bibtex[k])}</li>
                <li><span className="underline">Year</span> : {StoreUtilities.getPropertyInObject("YEAR", bibtex[k])}</li>
            </ul>)
          i++;
          result.push(<hr key={i}/>)
          i++;
        }
      }
      //title of references area
      if(result.length > 0){
        result.unshift(<strong key="0">References :</strong>);
      } else {
        if(bibtex !== '' && result.length === 0){
          result.push(<strong key="0">No reference</strong>);
        }
      }
    }catch(e){
      console.log(e);
      result.push(<p key="bibtex-error">Error : Invalid bibtex content</p>)
    }

    return result;
  },

/**
* Return an ordered list of query date formatted in html 
*/

  getQueryList : function(){
    var result = [];
    if(this.props.reference !== null){
      var timestamps = this.props.reference.timestamps;      
      // list of displayed timestamps
      var printed_timestamps = []; 
      for(var i=0; i<timestamps.length; i++){
        // timestamp of get request only
        if(StoreUtilities.isGet(timestamps[i])){
          printed_timestamps.push(timestamps[i]['timestamp']);
        }
      }
      printed_timestamps = printed_timestamps.sort();
      for(var i=0; i<printed_timestamps.length; i++){
        //timestamps are converted into dates
        result.push(<li key={i+1}>{StoreUtilities.timestampToDate(printed_timestamps[i])}</li>);
      }
    }
    return result;
  },

  /**
  * Return value of top css property for the div
  * @param suggestedtop  value suggested from the cursor position
  */
  getTopPosition : function(suggestedtop){
    var top = suggestedtop;
    var height = Math.round($(".references").height());
    var excess = document.body.clientHeight - ( top + height );
    if( excess < 0 ){
      top = top + excess;
    }
    return top;
  },
  
  getVisibility : function(){    
    if(this.props.reference.uuid === ''){
      return "hidden";
    }      
    return "visible";
  },

  render : function(){

    var references = this.getBibtex();
    var bibtex_src = this.props.reference.bibtex ;
    var timestamps = this.getQueryList();

    var timestamp_title = timestamps.length > 0 ? <strong>Request result downloaded on (UTC+1) :</strong> : "";
    var width = Math.round($(".references").width());
    return (
      <div className={this.getVisibility()}>
        <div>         
          <div>
            <p>
              <strong>Data source </strong> : {this.props.reference.datasource}
            </p>
            <p>
              <strong>Data source version </strong> : {this.props.reference.resourceversion}
            </p>
            <p>
              <strong>Request </strong> : {this.props.reference.query}
            </p>
            <p>
              <strong>Request UUID </strong> : {this.props.reference.uuid}
            </p>
          </div>
          <div>
            <p>
              <strong>Request result</strong> : <a href={this.props.reference.xsams}>XSAMS file</a>
            </p>
            <p>
              <strong>XSAMS version</strong> : {this.props.reference.outputformatversion}
            </p>
          </div>
          <div>
            {references}
          </div>
          <HiddableDiv content={bibtex_src} contentName="bibtex code" />
          <div>
            {timestamp_title}
            <ul>
              {timestamps}
            </ul>
          </div>
        </div>
      </div>
    );
  }
});


/**
 * Main container
 * @param serviceApi  url of service returning the list of queries
 * @param queryId     request uuid
 */
var MainComponent = React.createClass({

  queryUrl : 'InfoQuery',

  getInitialState: function() {
    return {
            component : null
    };
  },

  /**
   * sends a request to the service to get the references linked to a query
   */
  queryApiForReferences : function(){
    var self = this;
    var jqxhr = $.ajax( this.props.serviceApi+self.queryUrl+"?uuid="+this.props.queryId )
      .done(function(data, textStatus, jqXHR) {
        //request has been correctly processed
        if(jqXHR.status === 200){
          if(data["queryInformation"] !== undefined){
            var reference = get_reference(data["queryInformation"]);
            self.setState({
              component : <QueryDetailBox reference={reference}/>
            });
          }
        // not yet processed or does not exist
        } else if(jqXHR.status === 204){          
            self.setState({
              component : <MessageBox text={"Request not available. Processing a new request take some time, please try again in a couple minutes."}/>
            });
        // error indicated by api when performing search
        } else if(data["queryError"] !== undefined){
          var error = get_error_info(data["queryError"]);
          self.setState({
            component : <QueryErrorBox error={error}/>
          });
        }
      })
      .fail(function( jqXHR, textStatus, errorThrown) {
        // no http error code, request did not reach the service
        if(jqXHR.status === 0){
          var message = "Request could not be completed because of wrong service url.";
          self.setState({component : <MessageBox text={message}/>});
        }else{
          var message = get_error_message(jqXHR.responseText);
          self.setState({component : <MessageBox text={message}/>});
        }
      });    
  },

  componentDidMount: function() {
    this.queryApiForReferences();
  },

  render : function() {
    var self = this;
    var component = "";
    
    if(this.state.component !== null)
      component = this.state.component;

    return (
      <div>
        {component}
      </div>
    );
  }

});

ReactDOM.render(
  <MainComponent serviceApi={SERVICE_URL} queryId={StoreUtilities.getUrlParameter("uuid")}/>,
  document.getElementById('data')
);
