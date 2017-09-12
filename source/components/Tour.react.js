import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import TourSteps from '../tour/tourSteps.js';

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

const Tour = React.createClass({
    
    componentDidMount: function() {
        //console.log('INFO: componentDidMount');
        if(typeof this.props.tour === 'string' && this.props.tour !== '') {
            this.renderTour(this.props.tour)    
        }
    },
    
    
    render: function() {
        
        if(this.props.tour === '') {
            return null;
        }
        
        if(typeof this.props.tour !== 'string') {
            return null;
        }
        
        let tourClass = 'currentTourStep ' + this.props.tour;
        console.log('RENDERING');
        
        return (
            <div className="tourBackground"></div>
        )
    },
    
    componentDidUpdate: function(prevProps,prevState) {
        //console.log('[DEBUG] componentDidUpdate')
        if(typeof this.props.tour === 'string' && this.props.tour !== '') {
            this.renderTour(this.props.tour)    
        }
    },
    
    renderTour: function(stepId) {
        
        console.log('-------renderTour')
        let tourObj = TourSteps[stepId];
        
        console.log(1);
        
        if(typeof tourObj === 'undefined') {
            console.log('[DEBUG] Unable to get tour item "' + stepId + '"')
            return false;
        }
        
        let targetElem = document.querySelector(tourObj.attachTo);
        
        if(targetElem === null) {
            console.log('[DEBUG] Unable to find anchors for tour "' + stepId + '", with an attachTo of "' + tourObj.attachTo + '"');
            //todo: revert tour
            return false;
        }
        
        console.log(targetElem);
        
        console.log(2);
        let div = document.createElement('div');
        ReactDOM.render(tourObj.content,div);
        console.log(tourObj.content)
        console.log(3);
        
        //define attachment based on values in tourObj
        let attachment;
        let targetAttachment;
        let offset;
        
        if(tourObj.attachWhere === 'top') {
            attachment = 'bottom center';
            targetAttachment = 'top center';
            offset = '10px 0';
        } else if(tourObj.attachWhere === 'right') {
            attachment = 'middle left';
            targetAttachment = 'middle right';
            offset = '0 10px';
        } else if(tourObj.attachWhere === 'bottom') {
            attachment = 'top center';
            targetAttachment = 'bottom center';
            offset = '10px 0';
        } else if(tourObj.attachWhere === 'left') {
            attachment = 'middle right';
            targetAttachment = 'middle left';
            offset = '0 10px';
        } else {
            attachment = 'bottom center';
            targetAttachment = 'top center';
            offset = '10px 0';
        }   
        
        console.log(attachment);
        console.log(targetAttachment);
        console.log(4);
        
        /*let tether = new Tether({
            element: tourElem,
            target: targetElem,
            attachment: attachment,
            targetAttachment: targetAttachment
        });
        tether.position();*/
        
        let drop = new Drop({
            target: targetElem,
            content: div,
            /*position: 'bottom left',*/
            openOn: 'always',
            constrainToWindow: true,
              classes: 'drop-theme-arrows',
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
        
        console.log('5     klumpatsch!!!')
        
        //tourElem.classList.add('tether-open');
        
        
        console.log(tourObj);
        
        //console.log(tether);
        console.log()
    }
});

Tour.propTypes = {
    tour: PropTypes.string.isRequired
};

export default Tour;