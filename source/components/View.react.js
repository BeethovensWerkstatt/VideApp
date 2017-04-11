import React, { PropTypes } from 'react';

import VIDE_PROTOCOL from '../_modules/vide-protocol';
import { ViewLayouts } from './../redux/layout.constants';

import {eohub} from '../_modules/eo-hub';

const View = React.createClass({
    
    unmount: function() {
        
        let viewType = this.props.view.moduleKey;
        
        try {
            eohub.unmountModule(viewType, this.props.pos);
            //console.log('[DEBUG]: unmounting ' + viewType + ' at "' + this.props.is + '_' + this.props.viewType + '"');
        } catch(err) {
            console.log('[DEBUG] no module for ' + this.props.view.perspective + ' available. Cannot unmount() -> ' + err);
        }
    },
    
    componentWillMount: function() {
        //console.log('INFO: componentWillMount');
    },
    
    componentDidMount: function() {
        //console.log('INFO: componentDidMount');
        this.sendRequest(this.props, this.state);
    },
    
    componentWillReceiveProps: function(nextProps) {
        //console.log('INFO: componentWillReceiveProps on ' + nextProps.pos);
    },
    
    shouldComponentUpdate: function(nextProps, nextState) {
        //console.log('INFO: shouldComponentUpdate');
        let needsUpdate = true;
        if(this.props.pos === nextProps.pos 
            && this.props.view.moduleKey === nextProps.view.moduleKey
            /*&& (this.props.layout === nextProps.layout
                || (this.props.layout !== ViewLayouts.SINGLE_VIEW
                    && nextProps.layout !== ViewLayouts.SINGLE_VIEW))*/) {
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
        
        //console.log('INFO: shouldComponentUpdate: ' + needsUpdate);
        
        //if view can stay the same, send request to the view for local adjustments
        if(!needsUpdate && nextProps.view.request !== this.props.view.request) {
            //console.log('sending request from inside shouldComponentUpdate')
            this.sendRequest(nextProps, nextState);
        }
            
        return needsUpdate;
    },
    
    componentWillUpdate: function(nextProps, nextState) {
        if(this.props.view.moduleKey !== nextProps.view.moduleKey) {
            //console.log('[DEBUG]: will call unmount()');
            this.unmount();
        }
    },
    
    componentDidUpdate: function (prevProps, prevState) {
        //console.log('[DEBUG] componentDidUpdate')
        
        //console.log('sending request from inside componentDidUpdate')
        this.sendRequest(this.props, this.state);
    },
    
    componentWillUnmount: function() {
        this.unmount();            
    },
    
    render: function() { 
        //console.log('[DEBUG] rendering view ' + this.props.view.perspective + ' at ' + this.props.pos)
        return (
            <div id={this.props.pos} className={'view ' + this.props.pos + ' ' + this.props.view.moduleKey}>
                
            </div>
        );
    },
    
    sendRequest: function(props, state) {
        
        let moduleKey = props.view.moduleKey;
        let module = eohub.getModule(moduleKey);
        
        //request default view    
        if(props.view.request === null || (typeof props.view.request === 'undefined')) {
            
            try {
                module.getDefaultView(props.pos);
            } catch(err) {
                console.log('[ERROR] unable to request default for ' + props.view.perspective + ': ' + err);
            }
        } else {
            
            let req = props.view.request;
            //console.log('[DEBUG] handle request for ' + req.getModuleKey());
            
            try {
                module.handleRequest(props.pos,req);    
            } catch(err) {
                console.log('[ERROR] unable to handle request for ' + moduleKey + ': ' + err);
                console.log(req);
            }
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