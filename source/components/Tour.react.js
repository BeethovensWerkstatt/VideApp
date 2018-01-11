import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import TourSteps from '../tour/tourSteps.js';
import {eohub} from './../_modules/eo-hub';

//Tours
var Drop = require('tether-drop');

//tour test
/*let tour = new Shepherd.Tour({
  defaults: {
    classes: 'shepherd-theme-arrows'
  }
});
 
tour.addStep('example', {
  title: 'Example Shepherd',
  text: 'Creating a Shepherd is easy too! Just create ...',
  attachTo: '.introduction'
});
tour.addStep('example2', {
  title: 'hello 2',
  text: 'hallo schritt',
  attachTo: '.editionList'
});

tour.start();*/


/*const Tour = ({ tour }) => {
    if (tour === '') {
        return null;
    }
  
    return (
        <div className="tourBackground">
            <h1>{tour}</h1>
        </div>
    );
};*/

let TourException = () => {
    console.log('emitting a tour exception')
}


class Tour extends React.Component {
    
    componentDidMount() {
        //console.log('INFO: componentDidMount');
        if(typeof this.props.tour === 'string' && this.props.tour !== '') {
        
            let renders = false;
            let iteration = 0;
            
            do {
                
                let func = () => {
                    this.renderTour(this.props.tour,iteration)
                }
            
                try {
                    if(iteration === 0) {
                        this.renderTour(this.props.tour,iteration);
                    } else {
                        console.log('[DEBUG] Trying to render tour for ' + (iteration + 1) + ' times now.')
                        window.setTimeout(func,iteration * 100);    
                    }
                    
                    renders = true;
                    
                } catch(err) {
                    /*if(err.type !== 'TourException') {
                        throw err;
                    }*/
                    //console.log('[ERROR] Tour error uncaught')
                    iteration++;                    
                }   
                
            } while (!renders);
        }
    }
    
    componentWillReceiveProps(nextProps) {
        /*console.log('Tour.componentWillReceiveProps');*/
        
        if(typeof nextProps.fullState.tour === 'string' && nextProps.fullState.tour !== '') {
            this.forceUpdate();
            /*console.log('  ')
            console.log(' forced update ')
            console.log('  ')*/
        }
    }
    
    render() {
        
        if(this.props.tour === '') {
            return null;
        }
        
        if(typeof this.props.tour !== 'string') {
            return null;
        }
        
        let tourClass = 'currentTourStep ' + this.props.tour;
        /*console.log('[DEBUG] rendering ' + tourClass);*/
        
        return (
            <div className="tourBackground"></div>
        )
    }
    
    componentDidUpdate(prevProps,prevState) {
        //console.log('[DEBUG] componentDidUpdate')
        if(typeof this.props.tour === 'string' && this.props.tour !== ''/* && !this.props.nolog*/) {
            
            let renders = false;
            let iteration = 0;
            
            do {
                
                let func = () => {
                    this.renderTour(this.props.tour,iteration)
                }
            
                try {
                    if(iteration === 0) {
                        this.renderTour(this.props.tour,iteration);
                    } else {
                        console.log('[DEBUG] Trying to render tour for ' + (iteration + 1) + ' times now.')
                        window.setTimeout(func,iteration * 100);    
                    }
                    
                    renders = true;
                    
                } catch(err) {
                    /*if(err.type !== 'TourException') {
                        throw err;
                    }*/
                    
                    iteration++;                    
                }   
                
            } while (!renders);
            
        }
    }
    
    shouldComponentUpdate(nextProps, nextState) {
        /*console.log('----------- nextProps.tour: ' + nextProps.tour);*/
        if(typeof nextProps.tour === 'string' && nextProps.tour !== ''/* && !nextProps.nolog*/) {
            return true;
        } else {
            return false;
        }
    }
    
    renderTour(stepId,delayCount = 0) {
        
        /*console.log('-------renderTour')*/
        let tourObj = TourSteps[stepId];
        
        if(typeof tourObj === 'undefined') {
            console.log('[DEBUG] Unable to get tour item "' + stepId + '"')
            return false;
        }
        
        //object seems fine, continue
        
        //add "restrictive" class to background to suppress all user events
        let bg = document.querySelector('.tourBackground');
        if(tourObj.restrictsAction && bg !== null) {
            bg.classList.add('restrictive');
        } else if(bg) {
            bg.classList.remove('restrictive');
        }
        
        let targetElem = document.querySelector(tourObj.attachTo);
        
        if(targetElem === null) {
            console.log('[DEBUG] Unable to find anchors for tour "' + stepId + '", with an attachTo of "' + tourObj.attachTo + '"');
            //todo: revert tour
            //return false;
            throw new TourException(delayCount);
        }
        
        let div = document.createElement('div');
        ReactDOM.render(tourObj.content[this.props.language],div);
        
        //define attachment based on values in tourObj
        let attachment;
        let targetAttachment;
        let offset;
        
        
        if(tourObj.attachWhere === 'top') {
            attachment = 'bottom center';
            targetAttachment = 'top center';
            offset = '10px 0';
        } else if(tourObj.attachWhere === 'top right') {
            attachment = 'bottom left';
            targetAttachment = 'top right';
            offset = '10px 10px';
        } else if(tourObj.attachWhere === 'right') {
            attachment = 'middle left';
            targetAttachment = 'middle right';
            offset = '0 10px';
        } else if(tourObj.attachWhere === 'bottom right') {
            attachment = 'top left';
            targetAttachment = 'bottom right';
            offset = '10px 10px';
        } else if(tourObj.attachWhere === 'bottom') {
            attachment = 'top center';
            targetAttachment = 'bottom center';
            offset = '10px 0';
        } else if(tourObj.attachWhere === 'bottom left') {
            attachment = 'top right';
            targetAttachment = 'bottom left';
            offset = '10px 10px';
        } else if(tourObj.attachWhere === 'left') {
            attachment = 'middle right';
            targetAttachment = 'middle left';
            offset = '0 10px';
        } else if(tourObj.attachWhere === 'top left') {
            attachment = 'bottom right';
            targetAttachment = 'top left';
            offset = '10px 10px';
        } else {
            attachment = 'bottom center';
            targetAttachment = 'top center';
            offset = '10px 0';
        }  
        
        let oldDrop = eohub.TourDrop;
        if(typeof oldDrop !== 'undefined' && oldDrop !== null) {
            
            try {
                let elems = document.querySelectorAll('.tourDrop.drop.drop-element'); 
                for(let i=0;i<elems.length;i++) {
                    elems[i].remove();  
                }    
            } catch(err) {
                console.log('[ERROR] Unable to delete drop')
            }
            
            /*oldDrop.destroy();*/
        }
        
        let drop = new Drop({
            target: targetElem,
            //classes: 'tourDrop',
            //classPrefix: 'tourDrop', //todo: fix classes!!!
            content: div,
            /*position: 'bottom left',*/
            openOn: 'always',
            constrainToWindow: true,
            classes: 'drop-theme-arrows tourDrop',
            beforeClose: () => {
                /*console.log('the drop is supposed to close now… (but I try to prevent that)');
                return false;*/
            },
            tetherOptions: {
                attachment: attachment,
                targetAttachment: targetAttachment,
                constraints: [
                  {
                    to: 'window',
                    pin: true,
                    attachment: 'both'
                  }
                ]
            }
        });
        
        eohub.TourDrop = drop;
        
        drop.on('close',(e) => {
            eohub.TourDrop = null;
        })
        
        let appElem = document.querySelector('body');
        let handlingFunc;
        
        handlingFunc = (event) => {
            
            /*console.log('')
            console.log('New event captured in capture phase: ')
            console.log(event)*/
            
            let isOk = false;
            let nextStep;
            let tourEnd = false;
            let allowedSelectors = [];
            
            for(let i=0;i<tourObj.allowedTargets.length;i++) {
                let elem = event.target.closest(tourObj.allowedTargets[i].selector);
                if(elem !== null) {
                    isOk = true;
                    allowedSelectors.push(tourObj.allowedTargets[i]);
                    
                    if(typeof tourObj.allowedTargets[i].state !== 'undefined') {
                        nextStep = tourObj.allowedTargets[i].state;
                    }
                    
                    if(typeof tourObj.allowedTargets[i].tourEnd !== 'undefined') {
                        tourEnd = tourObj.allowedTargets[i].tourEnd;
                    }
                }
            }
            
            //console.log('    values are isOk:' + isOk + ' | nextStep:' + nextStep + ' | stepId: ' + stepId);
            
            if(tourObj.restrictsAction && !isOk) {
                event.stopPropagation();
                event.preventDefault();
                /*console.log('    stopped event on')
                console.log(event.target);*/
            } else if(event.type === 'click' || event.type === 'change') {
                //only resolve event when it's a click
                
                //console.log('--------passing event of type ' + event.type + ' on to step ' + nextStep)
                
                //kill the existing Drop
                drop.destroy();
                //remove listener
                appElem.removeEventListener('click',handlingFunc,true);
                appElem.removeEventListener('change',handlingFunc,true);
                appElem.removeEventListener('mousedown',handlingFunc,true);
                
                if(tourEnd) {
                    this.props.closeTour();
                } else if(typeof nextStep !== 'undefined') {
                    //console.log('-----------On my way to ' + nextStep)
                    this.props.loadTourStep(nextStep);
                } else {
                    /*this.props.closeTour();*/
                }
                
                //Special Treatment for Select Boxes
                if(event.type === 'click' && typeof allowedSelectors[0].selectBox !== 'undefined') {
                    
                    document.VideApp = {};
                    document.VideApp.openTour = (value) => {
                       
                        let target;
                        
                        for(let n=0; n<allowedSelectors[0].selectBox.allowedValues.length;n++) {
                            let allowedValue = allowedSelectors[0].selectBox.allowedValues[n];
                            
                            if(value === allowedValue.value) {
                                target = allowedValue.state;
                            }
                        }
                        
                        if(typeof target !== 'undefined') {
                            this.props.loadTourStep(target);
                            return true;
                        } else {
                            return false;
                        }
                        
                    }
                    
                    //appElem.setAttribute('data-nextTourStep','tool004');
                    
                }
                
            } else {
                //other event types aren't resolved
                //console.log('passing event on without closing listeners')
            }
        }
        
        appElem.addEventListener('click',handlingFunc,true);
        appElem.addEventListener('change',handlingFunc,true);
        appElem.addEventListener('mousedown',handlingFunc,true);
        
    }
};

Tour.propTypes = {
    tour: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    closeTour: PropTypes.func.isRequired,
    loadTourStep: PropTypes.func.isRequired,
    nolog: PropTypes.bool.isRequired,
    fullState: PropTypes.object.isRequired
};

export default Tour;