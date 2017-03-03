import React, { PropTypes } from 'react';

import VIDE_PROTOCOL from '../_modules/vide-protocol';
import { ViewLayouts } from './../redux/layout.constants';

import {eohub} from '../_modules/eo-hub';

const View = React.createClass({
    
    unmount: function() {
        
        let viewType = '';
        
        try {
            window.EoHub.unmountModule(viewType, this.props.is + '_' + this.props.viewType);
            //console.log('[DEBUG]: unmounting ' + viewType + ' at "' + this.props.is + '_' + this.props.viewType + '"');
        } catch(err) {
            console.log('[DEBUG] no module for ' + this.props.viewType + ' available. Cannot unmount() -> ' + err);
        }
    },
    
    componentWillMount: function() {
        console.log('INFO: componentWillMount');
    },
    
    componentDidMount: function() {
        console.log('INFO: componentDidMount');
        this.sendRequest(this.props, this.state);
    },
    
    componentWillReceiveProps: function(nextProps) {
        console.log('INFO: componentWillReceiveProps on ' + nextProps.is);
    },
    
    shouldComponentUpdate: function(nextProps, nextState) {
        console.log('INFO: shouldComponentUpdate');
        let needsUpdate = true;
        if(this.props.pos === nextProps.pos 
            && this.props.view.perspective === nextProps.view.perspective
            && (this.props.layout === nextProps.layout
            || (this.props.layout !== ViewLayouts.SINGLE_VIEW
            && nextProps.layout !== ViewLayouts.SINGLE_VIEW))) {
            needsUpdate = false;
            
            //this is a switch from vertical to horizontal layout
            /*if(this.props.layout !== nextProps.layout) {
                try {
                    let elem = document.getElementById(this.props.pos);
                    
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
            }*/
            
            //todo: if necessary, send commands to view from here…
        }
        
        if(!needsUpdate && nextProps.view.viewState !== null && nextProps.view.viewState !== this.props.view.viewState) {
            this.sendRequest(nextProps, nextState);
        }
            
        return needsUpdate;
    },
    
    componentWillUpdate: function(nextProps, nextState) {
        if(this.props.view.perspective !== nextProps.view.perspective) {
            //console.log('[DEBUG]: will call unmount()');
            this.unmount();
        }
    },
    
    componentDidUpdate: function (prevProps, prevState) {
        console.log('[DEBUG] componentDidUpdate')
        
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
        console.log('[DEBUG] rendering view ' + this.props.view.perspective + ' at ' + this.props.pos)
        return (
            <div id={this.props.pos} className={'view ' + this.props.pos + ' ' + this.props.view.perspective}>
                
            </div>
        );
    },
    
    sendRequest: function(props, state) {
    
        //request default view    
        if(props.view.target === null) {
            let moduleKey;
            
            if(props.view.perspective === VIDE_PROTOCOL.PERSPECTIVE.TRANSCRIPTION) {
                moduleKey = 'videTranscriptionViewer';
            } else if(props.view.perspective === VIDE_PROTOCOL.PERSPECTIVE.TEXT) {
                moduleKey = 'videMEITextViewer';
            } else if(props.view.perspective === VIDE_PROTOCOL.PERSPECTIVE.XML) {
                moduleKey = 'VideXmlViewer';
            } else if(props.view.perspective === VIDE_PROTOCOL.PERSPECTIVE.FACSIMILE) {
                moduleKey = 'VideFacsimileViewer';
            } else if(props.view.perspective === VIDE_PROTOCOL.PERSPECTIVE.RECONSTRUCTION) {
                moduleKey = 'videReconstructionViewer';
            } else if(props.view.perspective === VIDE_PROTOCOL.PERSPECTIVE.INVARIANCE) {
                moduleKey = 'videInvarianceViewer';
            }
            
            console.log('[DEBUG] request default view for ' + moduleKey);
            
            //try {
                eohub.requestDefault(moduleKey, props.pos);    
            //} catch(err) {
            //    console.log('[ERROR] unable to request default for ' + props.view.perspective + ': ' + err);
            //}
        } else {
        
            //todo
        
            /*let req = props.view.viewState;
            let module = eohub.getModule(req.getModuleKey());
            
            //console.log('[DEBUG] handle request for ' + req.getModuleKey());
            
            try {
                module.handleRequest(req);    
            } catch(err) {
                console.log('[ERROR] unable to handle request for ' + props.viewType + ': ' + err);
                console.log(req);
            }*/
        }
    }
});


View.propTypes = {
    view: PropTypes.object.isRequired,
    pos: PropTypes.oneOf(['view1', 'view2']).isRequired,
    edition: PropTypes.string.isRequired,
    revision: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired
};

export default View;