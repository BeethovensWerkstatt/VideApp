import React from 'react';
import PropTypes from 'prop-types';

import VIDE_PROTOCOL from '../_modules/vide-protocol';
import { ViewLayouts } from './../redux/layout.constants';

import {eohub} from '../_modules/eo-hub';

class View extends React.Component {
    
    unmount() {
        
        let viewType = this.props.view.moduleKey;
        
        try {
            eohub.unmountModule(viewType, this.props.pos);
            //console.log('[DEBUG]: unmounting ' + viewType + ' at "' + this.props.is + '_' + this.props.viewType + '"');
        } catch(err) {
            console.log('[DEBUG] no module for ' + this.props.view.perspective + ' available. Cannot unmount() -> ' + err);
        }
    }
    
    /*componentWillMount: function() {
        //console.log('INFO: componentWillMount');
    },*/
    
    componentDidMount() {
        //console.log('INFO: componentDidMount');
        this.sendRequest(this.props, this.state);
    }
    
    /*componentWillReceiveProps: function(nextProps) {
        //console.log('INFO: componentWillReceiveProps on ' + nextProps.pos);
    },*/
    
    shouldComponentUpdate(nextProps, nextState) {
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
            
            this.sendRequest(nextProps, this.state);
        }
            
        return needsUpdate;
    }
    
    componentWillUpdate(nextProps, nextState) {
        if(this.props.view.moduleKey !== nextProps.view.moduleKey) {
            //console.log('[DEBUG]: will call unmount()');
            this.unmount();
        }
    }
    
    componentDidUpdate(prevProps, prevState) {
        //console.log('[DEBUG] componentDidUpdate')
        
        //console.log('sending request from inside componentDidUpdate')
        this.sendRequest(this.props, this.state);
    }
    
    componentWillUnmount() {
        this.unmount();            
    }
    
    render() { 
        //console.log('[DEBUG] rendering view ' + this.props.view.perspective + ' at ' + this.props.pos)
        return (
            <div id={this.props.pos} className={'view ' + this.props.pos + ' ' + this.props.view.moduleKey}>
                
            </div>
        );
    }
    
    sendRequest(props, state) {
        
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
                
                /*console.log('------------------------------43')
                console.log(props.layout)
                console.log(props.otherView)*/
                
                if(props.synced && (props.layout === ViewLayouts.VERTICAL_SPLIT || props.layout === ViewLayouts.HORIZONTAL_SPLIT)) {
                    let altPos = (props.pos === 'view1' ? 'view2' : 'view1');
                    let altModuleKey = props.otherView.moduleKey;
                    let altModule = eohub.getModule(altModuleKey);
                    let modReq = Object.assign({}, req, {
                        perspective: altModule.getSupportedPerspective()
                    });
                    
                    /*console.log('--------------------------------44')
                    console.log('Trying to do weird things at ' + altPos + ' with ' + altModuleKey)
                    console.log(altModule)
                    console.log(modReq)*/
                    
                    altModule.handleRequest(altPos,modReq);
                }
                
            } catch(err) {
                console.log('[ERROR] unable to handle request for ' + moduleKey + ': ' + err);
                console.log(req);
            }
        }
    }
};


View.propTypes = {
    view: PropTypes.object.isRequired,
    otherView: PropTypes.object, //optional, only provided when multiple views are shown
    synced: PropTypes.bool, //optional, only provided when multiple views are shown
    pos: PropTypes.oneOf(['view1', 'view2']).isRequired,
    edition: PropTypes.string.isRequired,
    revision: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    layout: PropTypes.string.isRequired
};

export default View;