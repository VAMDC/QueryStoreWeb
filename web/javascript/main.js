// main.js
var React = require('react');
var ReactDOM = require('react-dom');
var $ = require("jquery");
var classNames = require('classnames');
var moment = require('moment');
var Datetime = require('react-datetime');
var parse = require("bibtex-parser");

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
* Menu
* @param defaultMenuItem   option selected by default
* @param menuItems         list of options
*/
var PureMenuBox = React.createClass({

  getInitialState : function() {
    return { selectedLabel : this.props.defaultMenuItem };
  },

  /**
  * returns true if label corresponds to the selected item
  */
  isSelectedLabel : function(label) {
    if (this.state.selectedLabel === label)
      return true;
    return false;
  },

  render : function() {
    var self = this;

    var setSelectedLabel = function(label){
      self.setState({selectedLabel : label});
      self.props.setSelectedBox(label);
    }

    return (
      <div className="pure-menu pure-menu-horizontal">
          <ul className="pure-menu-list">
            {
              this.props.menuItems.map(function(item, i){
                const isSelected = self.isSelectedLabel(item);
                return <PureMenuElement label={item} onClick={setSelectedLabel} isSelected={isSelected} key={i}/>
              })
            }
          </ul>
      </div>
    );
  }
});

/**
* Menu item
* @param label       text displayed in item
* @param isSelected  boolean indicating if the item is selected ( true if selected )
* @param onClick     action performed when item is selected
*/
var PureMenuElement = React.createClass({

  getInitialState : function() {
    return {isSelected : false};
  },

  handleClick : function() {
    this.props.onClick(this.props.label);
  },

  render : function() {
    var btnClass = classNames({
          'pure-menu-item': true,
          'pure-menu-selected': this.props.isSelected
    });

    return (
      <li className={btnClass}><a  href="javascript:;" className="pure-menu-link" onClick={this.handleClick}>{this.props.label}</a></li>
    );
  }
});

/**
 * Element containing several ReactTableElement
 * @param title         table title
 * @param tableHeader   header columns content
 * @param tableKeys     field of tableContent that will be displayed
 * @param tableContent  content to be displayed in the table
 * @param lineFilter    line hidden if lineFilter(line) is false
 *  
 */
var ReactTableElement = React.createClass({


  /**
   * returns a list of values to diplay in a tr element : [{value:"", type:""}]
   */
  getDisplayedData : function(data_row){
    var self = this;
    var result = [];
    for (var column in self.props.tableKeys){
      result.push({ 'value':data_row[self.props.tableKeys[column].field], 'type':self.props.tableKeys[column].type});
    }
    return result;

  },

  componentDidMount: function() {
    var newTableObject = document.getElementById("data-table-content");
    sorttable.makeSortable(newTableObject);
  },
  
  render : function(){
    var self = this;
    var className = "pure-table "+this.props.class;

    return (
    <div id="data-table">
      <p>{this.props.title}</p>
      <table id="data-table-content" className={className}>
        <thead>
          <TableHeaderRowElement content={this.props.tableHeader} />
        </thead>
        <tbody>
          {
            this.props.tableContent.map(function(data_row, i){
              //displays only get requests
              if(self.props.lineFilter(data_row))            
                return <TableContentRowElement content={self.getDisplayedData(data_row)} key={i} handleClick={self.props.lineFilter}/>
            })
          }
        </tbody>
      </table>
    </div>
    );
  }
});

/**
 * tr element in tbody
 * @param content     content to display in cells
 * @param key         id of row
 * @param onClick     function called when link is clicked in the line
 */
function TableContentRowElement(props){
  const content = props.content;
  const key = props.contentKey;
  const onClick = props.handleClick;
  return (
  <tr key={key}>
    {
      content.map(function(cell_content, i){
        cell_content.key = i;
        cell_content.handleClick = onClick;
        return tableCellFactory.getCell(cell_content)
      })
    }
  </tr>
  );
};

/**
 * tr element in thead
 * @param content     content to display in cells *
 */
function TableHeaderRowElement(props){
  const content = props.content;
  return (
  <tr>
    {
      content.map(function(cell_content, i){
        return <TableHeaderElement content={cell_content} key={i}/>
      })
    }
  </tr>
  );
};


/**
 * th element
 * @param content   displayed content
 */
function TableHeaderElement(props) {
  var content = props.content
  return (
  <th>{content}</th>
  );
};

/**
 * td element containing simple text
 * @param content   displayed content
 */
function TableCellTextElement(props){
  const content = props.content;
   return (
    <td>{content}</td>
   );
};

/**
* td element containing a clickable uuid
* @param content        displayed content
* @param handleClick    function called when link is clicked
*/
var TableCellSelectableTextElement = React.createClass({

  handleClick : function(event){
    this.props.handleClick(event, this.props.content);
  },

  render : function(){
    return (
      <td><span className="clickable" onClick={this.handleClick}>{this.props.content}</span></td>
    );
  }
});

/**
* td element containing a sql-like query
* @param content   displayed content
*/
var TableCellQueryElement = React.createClass({

  fullText : null,
  shortText : null,

  getInitialState : function(){
    return {displayedText : this.getDisplayedText(this.props.content.replace("query=", "").replace(";", ""))};
  },

  getDisplayedText : function(text){
    var result = text;
    if(text.length > 30)
      result = text.substr(0, 29) + " \u2026";
    return result;
  },



  render : function(){
    this.fullText = this.props.content.replace("query=", "").replace(";", "");
    this.shortText = this.getDisplayedText(this.fullText);
    return (
    <td onMouseEnter={()=>{this.setState({displayedText : this.fullText});}}
        onMouseLeave={()=>{this.setState({displayedText : this.shortText});}}
    >{this.state.displayedText}</td>
    );
  }

});

/**
 * td element displaying a <a> element
 * @param content   list of strings
 */
function TableCellUrlElement(props){
  const text = props.text;
  const href = props.href;
   return (
    <td><ExternalLinkElement href={href} text={text}/></td>
   );
};

/**
 * td element displaying a timestamp
 * @param content   list of strings
 */
function TableCellTimestampsElement(props){
  const content = props.content.sort();
  var dates = [];
  for(var i = 0; i < content.length; i++){
    dates.push(<li key={i}>{timestamp_to_date(content[i])}</li>);
  }

  return (
    <td><ul>{dates}</ul></td>
   );
};

/**
 * returns a td element according to data type
 */
var tableCellFactory = {

  cellTypes : {
    timestamps : "timestamps",
    text : "text",
    url : "url",
    query : "query",
    uuid : "uuid",
  },
  /**
  *  Return a cell object according to given cell type
  *  @param cell    a cell type
  */
  getCell : function(cell){
    if(cell.type === this.cellTypes.url)
      return <TableCellUrlElement content={cell.value} key={cell.key}/>
    else if(cell.type === this.cellTypes.timestamps)
      return <TableCellTimestampsElement content={cell.value} key={cell.key}/>
    else if(cell.type === this.cellTypes.query)
      return <TableCellQueryElement content={cell.value.join(', ')} key={cell.key}/>
    else if(cell.type === this.cellTypes.uuid){
      return <TableCellUrlElement text={cell.value} href={'http://cite.vamdc.eu/references.html?uuid='+cell.value} key={cell.key}/>
    }
    else
      return <TableCellTextElement content={cell.value} key={cell.key}/>
  }
}

/**
 * <a> element
 * @param href    linked page
 * @param text    displayed text
 */
function ExternalLinkElement (props){
  const text = props.text;
  const href = props.href;
   return (
    <a href={href} target="_blank">{text}</a>
   );
};



/**
 * input type = text element with a label
 * @param label text displayed in label
 * @param name input element name
 * @param onChange action performed when content is changed
 */
var InputDateComponent = React.createClass({

  getInitialState : function(){
    return {value : ''};
  },

  change: function(moment){
    var value = "";   
    try{
      if ( moment.toString().trim() !== "" ){
        value =  moment.unix()*1000;
      }      
    }catch(e ){
      console.log(e);
      alert("Error when converting date to timestamp.");
    }

    // setState is async, use callback function to do action after update
    this.setState({value : value}, function(){
      this.props.onChange(this.props.name , this.state.value);
    });
  },

  render: function() {

    return (
    <div>
      <label>{this.props.label}</label>
      <Datetime onChange={this.change}/>
    </div>
    );
  }
});


/**
 * input type = text element with a label
 * @param label text displayed in label
 * @param name input element name
 * @param onChange action performed when content is changed
 */
var InputNumberComponent = React.createClass({

  getInitialState : function(){
    return {value : '', inputClass : true};
  },

  handleChange : function(event){
    var inputClass = "wrong-value";
    const value = event.target.value;
    if(($.isNumeric(value) && Math.floor(value) == value) || value.trim() === ''  ) {
      inputClass = "";
    }

    this.setState({value : event.target.value, inputClass : inputClass}, function(){
      this.props.onChange(this.props.name , this.state.value);
    });
  },

  render : function(){
    return(
      <div>
          <label>{this.props.label}</label>
          <input type="text" value={this.state.value} onChange={this.handleChange} className={this.state.inputClass}></input>
      </div>
    );
  }

});

/**
 * button with pure-css styling
 * @param label text displayed in button
 * @param action action executed when button is clicked
 */
var PureButtonComponent = React.createClass({

  handleClick : function(event){
    this.props.action();
  },

  render : function(){
    return(
      <div>
        <button className="pure-button" type="button" onClick={this.handleClick}>{this.props.label}</button>
      </div>
    );
  }
});

/**
 * Pure grid with two columns, widths are editable
 * @param leftWidth width of left column
 * @param rightWidth width of right column
 * @param leftComponent
 * @param rightComponent
 */
function PureGridTwoColumnsBox (props){

  const leftComponent = props.leftComponent;
  const rightComponent = props.rightComponent;

  const left_class = "pure-u-"+props.leftWidth+"-24";
  const right_class = "pure-u-"+props.rightWidth+"-24";

  return (
    <div className="pure-g">
        <div className={left_class}>{leftComponent}</div>
        <div className={right_class}>{rightComponent}</div>
    </div>
  );
};

/**
 * Formular to build a request
 * @param nodes list of node objects
 * @param serviceApi url of the query service api
 * @param onChange action performed when content of a field is modified
 * @param doQuery action performed when request is executed
 *
 */
var QueriesFormBox = React.createClass({

  /**
   * get suggestions from distant service
   */
  componentDidMount: function() {
      this.serverRequest = $.get(this.props.serviceApi+"/FindQueries", function (result) {
        this.setState({
          concepts : result
        });
      }.bind(this));
  },

  getInitialState : function() {
    return {
      concepts : []
    };
  },


  render : function(){
    return (
      <div id="form">
        <form className="pure-form pure-form-stacked">
          <fieldset>
            <InputDateComponent name="from" label="From" onChange={this.props.onChange}/>
            <InputDateComponent name="to" label="To" onChange={this.props.onChange}/>
            <PureButtonComponent label="Submit" action={this.props.doQuery}/>
          </fieldset>
        </form>
      </div>
    );
  }
});

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
 * Display a checkbox
 * @param value     list of values to display
 * @param checked   true if boxes are checked by default 
 * @param id        id of the element
 * @param onChange  function called when the box is clicked
 * 
 */
var CheckBox = React.createClass({    
  render : function(){
    return(
      <input type="checkbox" value={this.props.value} 
      id={this.props.id} checked={this.props.checked}
      onChange={this.props.onChange}/>
    );
  }
   
});

/**
 * @param values      list of values to display
 * @param elementId
 * @param title       title displayed before checkboxes
 * @param toggleAll
 * 
 */
 var CheckBoxesList = React.createClass({
  
  getInitialState : function() {
    return {
      //to be displayed as checkboxes
      boxes : [],
      //dictionary resource_name : boolean
      //true if resource is selected
      boxesStatus : {}
    };
  },
  
  componentWillReceiveProps : function(nextProps){
    /**
     * all checkboxes are checked by default
     * executed once when list is received
     */
    if(Object.keys(this.state.boxesStatus).length === 0){
      var boxesStatus = {};
      for(var i = 0; i<nextProps.values.length; i++){     
        boxesStatus[nextProps.values[i]] = true;
      }      
      this.setState({boxesStatus : boxesStatus });   
    }    
  },
  
  /**
   * called when checkbox status change
   * @param evt   event that triggered the call
   */
  onCheckBoxChange : function(evt){
    var checked = evt.target.checked;
    var value = evt.target.value;
    var updatedBoxes = this.state.boxesStatus;    
    updatedBoxes[value] = checked;   
    this.setState({boxesStatus : updatedBoxes}, function(){
      this.props.toggled(checked, value);
    });
  },
  
  /**
   * all checkboxes checked
   */
  selectAllNodes(){
    this.switchAllNodes(true);
  },

  /**
   * all checkboxes unchecked
   */  
  deselectAllNodes(){
    this.switchAllNodes(false);
  },
 
  /**
   * toggle all checkboxes selection
   * @param   boolean
   */
  switchAllNodes(checked){
    var updatedBoxes = this.state.boxesStatus;   
    for(var key in updatedBoxes) 
      updatedBoxes[key] = checked;   
      
    this.setState({boxesStatus : updatedBoxes}, function(){
      this.props.toggleAll(checked);
    });
  },  
   
  render : function(){
    var boxes = [];
    
    for(var i = 0; i<this.props.values.length; i++){      
      boxes.push(<p key={i}>
                    <CheckBox value={this.props.values[i]} 
                    
                    id={this.props.elementId+i}
                    onChange={this.onCheckBoxChange}
                    checked={this.state.boxesStatus[this.props.values[i]]}/>                    
                    <label htmlFor={this.props.elementId+i}>{this.props.values[i]}</label>
                  </p>);
    }

    var title = '';
    var buttons = '';   
    
    if(this.props.values.length > 0){
      title = this.props.title;
      buttons = <p>
                  <button onClick={this.selectAllNodes}>Select all</button>
                  <button onClick={this.deselectAllNodes}>Unselect all</button>      
                </p>
    }

    return (
      <div>
        <p><strong>{title}</strong></p>
        {boxes}
        {buttons}
      </div>
    );
  }

});

/**
 * @param bibtex      bibtex content to format and display
 * @param query       query object, with a list of timestamps
 * @param xsams       link to saved xsams file
 * @param uuid        id of displayed request
 * @param positionX   x position for the box in pixels
 * @param positionY   y position for the box in pixels
 *
 */
var QueryDetailBox = React.createClass({
  // width : 600,
  getInitialState : function() {
    return {
      positionX : 0,
      positionY : 0
    };
  },

 /**
 *  Return html formatted bibtex
 */
  getBibtex : function(){
    var bibtex = parse(this.props.bibtex);

    var result = [];
    var i = 1;

    for (var k in bibtex) {
      if( get_property_in_object("TITLE", bibtex[k]) !== "not available" &&
          get_property_in_object("JOURNAL", bibtex[k]) !== "not available"){
        result.push(
          <ul key={i}>
              <li><span className="underline">Title</span> : {get_property_in_object("TITLE", bibtex[k])}</li>
              <li><span className="underline">Journal</span> : {get_property_in_object("JOURNAL", bibtex[k])}</li>
              <li><span className="underline">Authors</span> : {get_property_in_object("AUTHOR", bibtex[k])}</li>
              <li><span className="underline">Pages</span> : {get_property_in_object("PAGES", bibtex[k])}</li>
              <li><span className="underline">Volume</span> : {get_property_in_object("VOLUME", bibtex[k])}</li>
              <li><span className="underline">Year</span> : {get_property_in_object("YEAR", bibtex[k])}</li>
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
      if(bibtex !== null && result.length === 0){
        result.push(<p><strong key="0">No reference</strong></p>);
      }
    }

    return result;
  },

/**
* Return list of query date formatted in html
*/

  getQueryList : function(){
    var result = [];
    if(this.props.query !== null){
      var timestamps = this.props.query["querySubmissionTimestamps"];
      for(var i=0; i<timestamps.length; i++){
        //timestamps are converted into dates
        result.push(<li key={i+1}>{timestamp_to_date(timestamps[i])}</li>);
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

  render : function(){

    var references = this.props.bibtex !== null ? this.getBibtex() : '';
    var bibtex_src = this.props.bibtex !== null ? this.props.bibtex : '';
    var timestamps = this.getQueryList();

    var timestamp_title = timestamps.length > 0 ? <strong>Request executed on (UTC+1) :</strong> : "";
    var width = Math.round($(".references").width());

    var style = {
      visibility : this.props.visibility,
      top : this.getTopPosition(this.props.positionY)+"px",
      left : (this.props.positionX-width)+"px"
    };

    return (
      <div className="references" style={style}>
        <div className="scrollable">
          <button className="pure-button" onClick={this.props.close}>X</button>
          <div>
            <p>
              <strong>Request UUID </strong> : {this.props.uuid}
            </p>
          </div>
          <div>
            <p>
              <strong>Request result</strong> : <a href={this.props.xsams}>XSAMS file</a>
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
 * Display queries in store
 * @param serviceApi url of web service
 */
var QueriesBox = React.createClass({

  serviceMethod : "FindQueries",

  tableHeader : ['Request', 'Acceded resource', 'UUID'],
  tableHeaderMapping : {  'Request': {
                            field:'parameters',
                            type: tableCellFactory.cellTypes.query},
                          'Acceded resource':{
                              field:'accededResource',
                              type : tableCellFactory.cellTypes.text},
                          'UUID': {
                            field : 'UUID',
                            type : tableCellFactory.cellTypes.uuid},
                        },

  getInitialState: function() {
    return {queries:[],
            parameters : {},
            rightComponent : null,
            visibleNodes : [],
            allNodes : [],
            allNodesData : []
          };
  },
  
  /**
   * update table content when a node 
   * has been selected/unselected
   * @param isChecked   boolean
   * @param value       selected node id
   */
  toggled : function(isChecked, value){
    var nodes = this.state.visibleNodes;
    if(isChecked){      
      nodes.push(value);
    }else{
      function notEqual(element){
        return element !== value;
      }
      nodes = nodes.filter(notEqual);
    }
    this.setState({visibleNodes : nodes}, function(){
      this.fillDisplayedData();
    });
  },
  
  /**
   * update table content when the whole node list 
   * has been selected/unselected
   * @param isChecked   boolean
   */
  toggleAll : function(isChecked){
    if(isChecked){
      var allNodes = this.state.allNodes;
      this.setState({visibleNodes : allNodes}, function(){
        this.fillDisplayedData();
      });
    }else{
      this.setState({visibleNodes : []}, function(){
        this.fillDisplayedData();
      });      
    }
  },
  
  /**
   * Update request list in table 
   */
  fillDisplayedData : function(){
    var displayed = [];
    for(var i = 0; i < this.state.queries['Queries'].length; i++){      
      if(this.state.visibleNodes.includes(this.state.queries['Queries'][i]['accededResource'])){        
        displayed.push(this.state.queries['Queries'][i]);    
      }
    }

    this.setState({allNodesData : displayed}, function(){
      this.setRightComponent();
    });
    
  },

  /**
  *  Fill right of the page with the list of queries in an html table
  */
  setRightComponent : function(){
    var right_component;
    if(is_empty_table(this.state.queries) == false)
      right_component =   <ReactTableElement  tableHeader={this.tableHeader}
                          tableKeys={this.tableHeaderMapping}
                          tableContent={this.state.allNodesData }
                          title=''
                          lineFilter={hasGet}/>;
    else
      right_component = <MessageBox text="No data available" />;

    this.setState({rightComponent : right_component});
  },

  /**
   * returns GET query, species are sorted in a node map
   */
  getQueryParameters : function(){
    var parameters = [];
    
    for (var value in this.state.parameters) {
      // add parameter if value is not empty
      if(this.state.parameters[value].trim().length > 0 )
        parameters.push(value+"="+this.state.parameters[value]);
    }
    return parameters.join("&");
  },

  /**
   * sends a request to the service to get list of queries in the store
   */
  queryApiForQueries : function(){
    var self = this;
    $.ajax({
      url: this.props.serviceApi+self.serviceMethod+"?"+self.getQueryParameters(),
      dataType: 'json',
      cache: true,
      beforeSend : function(jqXHR, settings){
        self.setState({rightComponent : <MessageBox text="Please wait while data are loading"/>});
      },
      success: function(data) {        
        var nodes = [];
        // get a list of all nodes 
        for(var i = 0; i < data['Queries'].length; i++){
          if(!nodes.includes(data['Queries'][i]['accededResource']))
            nodes.push(data['Queries'][i]['accededResource']);
        }       
        
        self.setState({queries : data, allNodes : nodes, visibleNodes : nodes}, function(){
          self.fillDisplayedData();          
        });

      }.bind(this),
      error: function(xhr, status, err) {
        var message = get_error_message(xhr.responseText);
        self.setState({rightComponent : <MessageBox text={message}/>});
      }.bind(this)
    });
  },  

  render : function(){
    var self = this;
    var update_function = function(parameter, value){
      var new_parameters = self.state.parameters;
      if(value != ""){
        new_parameters[parameter] = encodeURIComponent(value);
      } else 
        new_parameters[parameter] = "";      
      self.setState({parameters : new_parameters });
    };
    // form to select displayed data
    var left_component = <div className="nodes-checkboxes">
                        <QueriesFormBox onChange={update_function} doQuery={this.queryApiForQueries} serviceApi={this.props.serviceApi}/>
                        <CheckBoxesList key="0" values={this.state.allNodes} elementId="nodesboxes" toggled={this.toggled} toggleAll={this.toggleAll} title="Acceded resources"/>
                        </div>;

    return(
      <div>
        <PureGridTwoColumnsBox leftWidth="5" rightWidth="19" leftComponent={left_component} rightComponent={this.state.rightComponent}/>
      </div>
    );
  }
});

/**
 * Home page
 */
function HomePageBox(props){
  return (
    <div>
      <h1>Welcome on the VAMDC Query store.</h1>
      <p className="first-level">
          This website is an access point to the central repository logging the
          requests received by the nodes in the infrastructure.
      </p>
    </div>
  );
};

/**
 * Displays text in a paragraph
 */
function CreditsBox(props){
  return (
    <div>
      <h1>Developers</h1>
      <div className="first-level">
        <h2>Query Store</h2>
        <ul>
          <li>Design and implementation : Carlo-Maria Zwolf (LERMA, Paris Observatory)</li>
          <li>Design : Nicolas Moreau (LERMA, Paris Observatory)</li>
        </ul>
      </div>
      <div className="first-level">
        <h2>Website</h2>
        <ul>
          <li>Nicolas Moreau (LERMA, Paris Observatory)</li>
        </ul>
      </div>

    </div>
  );
};



/**
 * Main container
 * @param serviceApi url of service returning the list of queries
 */
var MainComponent = React.createClass({

  defaultSelection : "Home",

  getInitialState : function() {
    return { selectedBox : this.defaultSelection };
  },

  /**
   * returns web site main sections with attached displayed objects
   */
  getSections : function(){
    return {  'Home' : <HomePageBox />,
              'Queries': <QueriesBox serviceApi={this.props.serviceApi}/>,
              'Credits': <CreditsBox />
          };
  },

  render : function() {
    var self = this;

    var setSelectedBox = function(label){
      self.setState({selectedBox : label});
    }

    var sections = this.getSections();

    return (
      <div>
        <div id="menu">
          <PureMenuBox menuItems={Object.keys(sections)} defaultMenuItem={this.defaultSelection} setSelectedBox={setSelectedBox}/>
        </div>
        <div id="queries">
          {sections[this.state.selectedBox]}
        </div>
      </div>
    );
  }

});

ReactDOM.render(
  <MainComponent serviceApi={SERVICE_URL} />,
  document.getElementById('data')
);
