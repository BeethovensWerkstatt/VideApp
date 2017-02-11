import React, { PropTypes } from 'react';

import { ViewTypes, ViewLayouts } from './../redux/actions.redux';
/*import EditionListController from './../containers/EditionListController.react';*/

const View = React.createClass({
    
    unmount: function() {
        if(viewType === ViewTypes.VIEWTYPE_EDITIONSLIST) {
            return false;
        }
        
        let viewType = '';
        
        if(this.props.viewType === ViewTypes.VIEWTYPE_XMLVIEW) {viewType = 'videXMLviewer';} else if(this.props.viewType === ViewTypes.VIEWTYPE_TRANSCRIPTIONVIEW) {viewType = 'videTranscriptionViewer';} else if(this.props.viewType === ViewTypes.VIEWTYPE_TEXTVIEW_MEI) {viewType = 'videMEITextViewer';} else if(this.props.viewType === ViewTypes.VIEWTYPE_FACSIMILEVIEW) {viewType = 'videFacsimileViewer';} else if(this.props.viewType === ViewTypes.VIEWTYPE_RECONSTRUCTIONVIEW) {viewType = 'videReconstructionViewer';} else if(this.props.viewType === ViewTypes.VIEWTYPE_INVARIANCEVIEW) {viewType = 'videInvarianceViewer';}
        
        try {
            window.EoHub.unmountModule(viewType, this.props.is + '_' + this.props.viewType);
            //console.log('[DEBUG]: unmounting ' + viewType + ' at "' + this.props.is + '_' + this.props.viewType + '"');
        } catch(err) {
            console.log('[DEBUG] no module for ' + this.props.viewType + ' available. Cannot unmount() -> ' + err);
        }
    },
    
    /*componentWillMount: function() {
        console.log('INFO: componentWillMount');
    },*/
    
    /*componentDidMount: function() {
        console.log('INFO: componentDidMount');
    },*/
    
    /*componentWillReceiveProps: function(nextProps) {
        console.log('INFO: componentWillReceiveProps on ' + nextProps.is);
    },*/
    
    shouldComponentUpdate: function(nextProps, nextState) {
        let needsUpdate = true;
        if(this.props.is === nextProps.is 
            && this.props.viewType === nextProps.viewType
            && (this.props.layout === nextProps.layout
            || (this.props.layout !== ViewLayouts.SINGLE_VIEW
            && nextProps.layout !== ViewLayouts.SINGLE_VIEW))) {
            needsUpdate = false;
            
            //this is a switch from vertical to horizontal layout
            if(this.props.layout !== nextProps.layout) {
                try {
                    let elem = document.getElementById(this.props.is + '_' + this.props.viewType);
                    
                    for (let oldValue of this.props.position.split(' ')) {
                        elem.classList.remove(oldValue);
                    }
                    for (let newValue of nextProps.position.split(' ')) {
                        elem.classList.add(newValue);
                    }
                    
                    elem.style.width = nextProps.style.width;
                    elem.style.height = nextProps.style.height;    
                } catch(err) {
                    console.log('[ERROR] Unable to set positions on view change without involving React. ' + err);
                    needsUpdate = true;
                }
            }
            
            //todo: if necessary, send commands to view from here…
        }
        
        if(!needsUpdate && nextProps.view.viewState !== null && nextProps.view.viewState !== this.props.view.viewState) {
            this.sendRequest(nextProps, nextState);
        }
            
        return needsUpdate;
    },
    
    componentWillUpdate: function(nextProps, nextState) {
        if(this.props.viewType !== nextProps.viewType) {
            //console.log('[DEBUG]: will call unmount()');
            this.unmount();
        }
    },
    
    componentDidUpdate: function (prevProps, prevState) {
        //console.log('[DEBUG] componentDidUpdate')
        
        /*if(this.props.viewType === ViewTypes.VIEWTYPE_XMLVIEW) {
            
            if(this.props.view.viewState === null)
                window.EoHub.requestDefault('videXMLviewer', this.props.is + '_' + this.props.viewType);
            else {
                let req = this.props.view.viewState;
                let module = window.EoHub.getModule(req.getModuleKey());
                module.handleRequest(req);
            }                
            
        } else if(this.props.viewType === ViewTypes.VIEWTYPE_FACSIMILEVIEW) {
            
            document.getElementById(this.props.is + '_' + this.props.viewType).innerHTML = '<div>FACSIMILE</div>'
            
        } else if(this.props.viewType === ViewTypes.VIEWTYPE_TRANSCRIPTIONVIEW) {
            window.EoHub.requestDefault('videTranscriptionViewer', this.props.is + '_' + this.props.viewType);            
        
        } else if(this.props.viewType === ViewTypes.VIEWTYPE_TEXTVIEW_MEI) {
            window.EoHub.requestDefault('videMEITextViewer', this.props.is + '_' + this.props.viewType);            
        }*/
        
        this.sendRequest(this.props, this.state);
    },
    
    componentWillUnmount: function() {
        this.unmount();            
    },
    
    render: function() { 
        //console.log('[DEBUG] rendering view ' + this.props.viewType + ' at ' + this.props.is)
        return (
            <div id={this.props.is + '_' + this.props.viewType} className={'view ' + this.props.position + ' ' + this.props.viewType} style={this.props.style}>
                {(this.props.viewType === ViewTypes.VIEWTYPE_EDITIONSLIST) ? <EditionListController/> : null}
                {(this.props.viewType !== ViewTypes.VIEWTYPE_EDITIONSLIST) ? null : null}
            </div>
        );
    },
    
    sendRequest: function(props, state) {
        let eohub = window.EoHub;
        
        //request default view    
        if(props.view.viewState === null) {
            let moduleKey;
            
            if(props.viewType === ViewTypes.VIEWTYPE_TRANSCRIPTIONVIEW) {
                moduleKey = 'videTranscriptionViewer';
            } else if(this.props.viewType === ViewTypes.VIEWTYPE_TEXTVIEW_MEI) {
                moduleKey = 'videMEITextViewer';
            } else if(this.props.viewType === ViewTypes.VIEWTYPE_XMLVIEW) {
                moduleKey = 'videXMLviewer';
            } else if(this.props.viewType === ViewTypes.VIEWTYPE_FACSIMILEVIEW) {
                moduleKey = 'videFacsimileViewer';
            } else if(this.props.viewType === ViewTypes.VIEWTYPE_RECONSTRUCTIONVIEW) {
                moduleKey = 'videReconstructionViewer';
            } else if(this.props.viewType === ViewTypes.VIEWTYPE_INVARIANCEVIEW) {
                moduleKey = 'videInvarianceViewer';
            }
            
            //console.log('[DEBUG] request default view for ' + moduleKey);
            
            try {
                eohub.requestDefault(moduleKey, props.is + '_' + props.viewType);    
            } catch(err) {
                console.log('[ERROR] unable to request default for ' + props.viewType + ': ' + err);
            }
        } else {
            let req = props.view.viewState;
            let module = eohub.getModule(req.getModuleKey());
            
            //console.log('[DEBUG] handle request for ' + req.getModuleKey());
            
            try {
                module.handleRequest(req);    
            } catch(err) {
                console.log('[ERROR] unable to handle request for ' + props.viewType + ': ' + err);
                console.log(req);
            }
        }
    }
});


View.propTypes = {
    viewType: PropTypes.string.isRequired,
    view: PropTypes.object.isRequired,
    is: PropTypes.string.isRequired, //firstView or secondView
    edition: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired,
    layout: PropTypes.string.isRequired
};

export default View;