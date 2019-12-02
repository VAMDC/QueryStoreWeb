// main.js
var React = require('react');
var ReactDOM = require('react-dom');
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
  reference.doi = data['DOI']!== null ? data['DOI'] : 'Not available';
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
class HiddableDiv extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      visibilityClass : "hidden",
      buttonText : "Show",
    };
    this.switchVisibility = this.switchVisibility.bind(this);
  } 

  switchVisibility(){
    if(this.state.visibilityClass === "hidden"){
      this.setState({visibilityClass : "visible", buttonText:"Hide"})
    }else{
      this.setState({visibilityClass : "hidden", buttonText:"Show"})
    }
  }

  render(){
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
}

/**
 * @param error     contain reference data of a request
 *
 */
class QueryErrorBox extends React.Component{

  constructor(props){
    super(props);
  }

  getVisibility(){    
    if(this.props.error.uuid === ''){
      return "hidden";
    }      
    return "visible";
  }
  
  render(){  
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
            <strong>Query UUID </strong> : {this.props.error.uuid}
          </p>
          <p>
            <strong>Query parameters </strong> : {this.props.error.parameters}
          </p>
        </div>
      </div>
    );    
  }
}

/**
 * @param reference     contain reference data of a request
 *
 */
class QueryDetailBox extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      referenceVisibility : "visible",
      bibtexVisibility : "hidden",
      bibRefSwitchText : "Bibtex"
    };

    this.getBibtex = this.getBibtex.bind(this);
    this.getQueryList = this.getQueryList.bind(this);
    //~ this.getTopPosition = this.getTopPosition.bind(this);
    this.getVisibility = this.getVisibility.bind(this);
    this.switchReferences = this.switchReferences.bind(this);
    
  }

 /**
 *  Return html formatted bibtex
 */
  getBibtex(){
    var result = [];
    try{
      var bibtex = parse(this.props.reference.bibtex);
      var i = 1;
      for (var k in bibtex) {
        if( StoreUtilities.getPropertyInObject("TITLE", bibtex[k]) !== "not available"){
          
          result.push(
            <ul key={i}>
                <li><span className="underline">Title</span> : {StoreUtilities.getPropertyInObject("TITLE", bibtex[k])}</li>
                <li><span className="underline">Journal</span> : {StoreUtilities.getPropertyInObject("JOURNAL", bibtex[k])}</li>
                <li><span className="underline">Authors</span> : {StoreUtilities.getPropertyInObject("AUTHOR", bibtex[k])}</li>
                <li><span className="underline">Pages</span> : {StoreUtilities.getPropertyInObject("PAGES", bibtex[k])}</li>
                <li><span className="underline">Volume</span> : {StoreUtilities.getPropertyInObject("VOLUME", bibtex[k])}</li>
                <li><span className="underline">Year</span> : {StoreUtilities.getPropertyInObject("YEAR", bibtex[k])}</li>
                <li><span className="underline">Reference name in bibtex</span> : {k}</li>
            </ul>)
          i++;
          result.push(<hr key={i}/>)
          i++;
        }else{
          if(StoreUtilities.getPropertyInObject("AUTHOR", bibtex[k]) !== 'N.N.'){
            result.push(<ul key={i}>
              <li><span className="underline">Reference name in bibtex</span> : {k}</li>
              <li><span className="underline">Error</span>: title is missing, please check bibtex source code to get more information.</li>
              </ul>)
            i++;
            result.push(<hr key={i}/>)
            i++;
          }
        }
      }
      //no reference found
      if(bibtex !== '' && result.length === 0){
        result.push(<strong key="0">No reference</strong>);
      }    
    }catch(e){
      console.log(e);
      result.push(<p key="bibtex-error">Error : Invalid bibtex content</p>)
    }
    return result;
  }

/**
* Return an ordered list of query date formatted in html 
*/

  getQueryList(){
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

      // sort timestamps in descending order
      printed_timestamps = printed_timestamps.sort(function(a, b) {
        return b - a;
      });
      for(var i=0; i<printed_timestamps.length; i++){
        //timestamps are converted into dates
        result.push(<li key={i+1}>{StoreUtilities.timestampToDate(printed_timestamps[i])}</li>);
      }
    }
    return result;
  }

  getVisibility(){    
    if(this.props.reference.uuid === ''){
      return "hidden";
    }      
    return "visible";
  }

  switchReferences(){
    if(this.state.bibRefSwitchText === "Bibtex"){
      this.setState({
        referenceVisibility : "hidden",
        bibtexVisibility : "visible",
        bibRefSwitchText : "HTML"
      });
    }else{
      this.setState({
        referenceVisibility : "visible",
        bibtexVisibility : "hidden",
        bibRefSwitchText : "Bibtex"
      });
    }
  }
  
  render(){

    var references = this.getBibtex();
    var bibtex_src = this.props.reference.bibtex ;
    var timestamps = this.getQueryList();

    var timestamp_title = timestamps.length > 0 ? <strong>Query result downloaded on (UTC+1) :</strong> : "";
    //~ var width = Math.round($(".references").width());    
    var doi = null;

    if (this.props.reference.doi !== "Not available" )
      doi = this.props.reference.doi;
    
    return (
      <div className={this.getVisibility()}>
        <div>         
          <div>
            <DoiSubmitComponent doi={doi} uuid={this.props.reference.uuid}/>
            <p>
              <strong>VAMDC data source identifier</strong>: {this.props.reference.datasource}
            </p>
            <p>
              <strong>Version of the VAMDC database producing the dataset</strong>: {this.props.reference.resourceversion}
            </p>
            <p>
              <strong>Query originating the data</strong>: {this.props.reference.query}
            </p>
            <p>
              <strong>Query identifier </strong>: {this.props.reference.uuid}
            </p>
          </div>
          <div>
            <p>
              <strong>Query produced dataset</strong>: <span><a href={this.props.reference.xsams}>XSAMS file</a> </span>
               <span> (if not available, please try again in a few minutes) </span>
            </p>
            <p>
              <strong>XSAMS version</strong> : {this.props.reference.outputformatversion}
            </p>          
          </div>
          <span>{timestamp_title}</span>
          <div className="scrollable-div">            
            <ul>
              {timestamps}
            </ul>
          </div>
          <div>
            <div className={this.state.referenceVisibility}> 
              <p><strong>Bibliographic references in the dataset</strong></p>          
              <div className="scrollable-div">              
                <div>
                  {references}
                </div>
              </div>            
             </div>
            </div>
          <div>     
            <div className={this.state.bibtexVisibility}>       
              <p><strong>Bibtex</strong></p>
              <div className="scrollable-div">                
                <div>
                  {bibtex_src}
                </div>
              </div>
            </div>
          </div>
          <div>
            <button onClick={this.switchReferences} 
                    className="pure-button pure-button-primary">
                <strong>{"Switch references to "+ this.state.bibRefSwitchText}</strong>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * @doi
 * @uuid
 */
class DoiSubmitComponent extends React.Component{

  constructor(props){
    super(props);
    this.askForDoi = this.askForDoi.bind(this);
  }

  askForDoi(){
    var xhr = StoreUtilities.getXhrWithCors("GET", SUBMIT_FOR_DOI_URL+this.props.uuid);
    xhr.send();
    xhr.addEventListener('readystatechange', function() {
      if(xhr.readyState === XMLHttpRequest.DONE){
        if (xhr.status === 200) {
          location.reload();   
        } else {
          alert("Unable to get a DOI for this request.");
        }
      }
    });    
  }
  

  render(){
    return(
    <div>
      { this.props.doi !== null ?
      (            
        <span>
            <a href={"https://doi.org/"+this.props.doi} target="_blank">
                <img src={"https://zenodo.org/badge/DOI/"+this.props.doi+".svg"} alt="DOI"/>
            </a>
        </span>
      ):
      ( <span>
            <button className="pure-button pure-button-primary" onClick={this.askForDoi}>No DOI yet - Get one</button>
        </span>)}
    </div>);
  }

}


/**
 * Main container
 * @param serviceApi  url of service returning the list of queries
 * @param queryId     request uuid
 */
class MainComponent extends React.Component{

  constructor(props){
    super(props);
    this.state = { component : null };
    this.queryUrl='InfoQuery';
    this.queryApiForReferences = this.queryApiForReferences.bind(this);
  
  }

  /**
   * sends a request to the service to get the references linked to a query
   */
  queryApiForReferences(){
    var self = this;
    var xhr = StoreUtilities.getXhrWithCors("GET", this.props.serviceApi+self.queryUrl+"?uuid="+this.props.queryId);
    var uuid = encodeURIComponent(this.props.queryId);
    xhr.send();
    xhr.addEventListener('readystatechange', function() {

      if(xhr.readyState === XMLHttpRequest.DONE){
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          if(data["queryInformation"] !== undefined){
            var reference = get_reference(data["queryInformation"]);
            self.setState({
              component : <QueryDetailBox reference={reference}/>
            });
          } else if(data["queryError"] !== undefined){
            var error = get_error_info(data["queryError"]);
            self.setState({
              component : <QueryErrorBox error={error}/>
            });
          }
        } else if(xhr.status === 204){
          self.setState({
            component : <MessageBox text={"Request not available. Processing a new request take some time, please try again in a couple minutes."}/>
          });
        } else if (xhr.status >= 400){
          var message = get_error_message(xhr.responseText);
          self.setState({component : <MessageBox text={message}/>});
        }
      }
    });   
  }

  componentDidMount() {
    this.queryApiForReferences();
  }

  render() {
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

}

ReactDOM.render(
  <MainComponent serviceApi={SERVICE_URL} queryId={StoreUtilities.getUrlParameter("uuid")}/>,
  document.getElementById('data')
);
