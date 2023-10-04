import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import TourSteps from '../tour/tourSteps.js';
import {eohub} from './../_modules/eo-hub';

import Popper from 'popper.js';

//Tours
//var Drop = require('tether-drop');

/**
 * @todo this exception is actually not thrown anywhere?
 * @class
 */
let TourException = (count) => {
    console.log('emitting a tour exception with count ' + count)
}

/**
 * The {@link Tour} class implements a React component that displays a link to start the tour
 * @extends React.Component
 */
class Tour extends React.Component {

    componentDidMount() {
        //console.log('INFO: componentDidMount');
        if(typeof this.props.tour === 'string' && this.props.tour !== '') {

            let renders = false;
            let iteration = 0;

            do {

                let func = () => {
                    this.renderTour(iteration)
                }

                try {
                    if(iteration === 0) {
                        this.renderTour(iteration);
                    } else {
                        //console.log('[DEBUG] Trying to render tour for ' + (iteration + 1) + ' times now.')
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
        //console.log('Tour.componentWillReceiveProps');
        if(this.props.tour === '' && nextProps.tour !== '') {
            this.forceUpdate();
            this.initializeTour(nextProps.tour);
        }


        if(typeof nextProps.fullState.tour === 'string' && nextProps.fullState.tour !== '') {
            //this.forceUpdate();
            /*console.log('  ')
            console.log(' forced update ')
            console.log('  ')*/
        }

        if(typeof this.props.tour === 'string' && this.props.tour !== '' && typeof nextProps.tour === 'string' && nextProps.tour === '') {
            try {
                document.querySelector('#tourPopper').remove();
            } catch(err) {
                console.log('[ERROR] Unable to find #tourPopper: ' + err)
            }
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
            <div className="tourBackground">
                <div id="tourPopper" className="popper">
                    <div className="closeTourButton" onClick={e => {
                        //e.preventDefault();
                        document.querySelector('#tourPopper').remove();
                        this.props.closeTour();
                    }}>
                        <i className="fa fa-times" aria-hidden="true"></i>
                    </div>
                    <div className='popper__arrow'></div>
                    <div className="tourContent">TourContent</div>
                </div>
            </div>
        )
    }

    componentDidUpdate(prevProps,prevState) {
        //console.log('[DEBUG] componentDidUpdate')
        if(typeof this.props.tour === 'string' && this.props.tour !== ''/* && !this.props.nolog*/) {

            let renders = false;
            let iteration = 1;

            do {

                let func = () => {
                    this.renderTour(iteration)
                }

                try {
                    if(iteration === 0) {
                        this.renderTour(iteration);
                    } else {
                        /*console.log('[DEBUG] Trying to render tour for ' + (iteration + 1) + ' times now.')*/
                        window.setTimeout(func,iteration * 100);
                    }

                    renders = true;

                } catch(err) {
                    /*if(err.type !== 'TourException') {
                  mam      throw err;
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

    /**
     * @param firstStep {string} the first step of the tour
     */
    initializeTour(firstStep) {
        /*console.log('\n \n \n INITIALIZING EVERYTHING \n \n \n \n')*/

        let handler = (event) => {
            this.handleTourEvent(event)
        }

        let app = document.querySelector('body');

        this.tourHandlers = [];

        this.tourHandlers.push(app.addEventListener('click',handler,true));
        this.tourHandlers.push(app.addEventListener('change',handler,true));
        this.tourHandlers.push(app.addEventListener('mousedown',handler,true));
    }

    /**
     * @param event {object}
     */
    handleTourEvent(event) {

        /*console.log('\n \n handleTourEvent ' + event.type + ' ' + this.props.tour + '')
        console.log(event)
        console.log('\n ')*/

        let currentStepId = this.props.tour;
        let tourObj = TourSteps[currentStepId];

        if(typeof tourObj === 'undefined') {
            console.log('\n [DEBUG] Unable to get tour item "' + stepId + '"')
            return false;
        }

        let isOk = false;
        let nextStep;
        let tourEnd = false;
        let allowedSelectors = [];

        //always allow to switch language
        tourObj.allowedTargets.push({selector:'.languageSwitch'});

        //always allow to close tour
        tourObj.allowedTargets.push({selector:'.closeTourButton'});

        //always allow to open links contained in the tour itself
        tourObj.allowedTargets.push({selector:'.tourContent a'});

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

        /*console.log(' Values are isOk:' + isOk + ' | nextStep:' + nextStep + ' | stepId: ' + currentStepId + ' | ' + allowedSelectors.length + ' allowedSelectors');
        console.log(allowedSelectors)*/


        /*
         * this is a fix for the view menu, which doesnt change values without this fix
         */
        let changeIsOk = false;
        if(event.type === 'change') {
            /*console.log('\n CHANGE EVENT:')
            console.log(event)
            console.log(isOk)
            console.log('\ngoing out\n\n')*/

            let selectIsAllowed = (allowedSelectors.length > 0) ? allowedSelectors[0].hasOwnProperty('selectBox') : false;
            let targetIsSelect = event.target.classList.contains('viewSelect');
            let selectionIsAllowed = false;

            if(allowedSelectors.length > 0 && allowedSelectors[0].hasOwnProperty('selectBox')) {
                for(let n=0; n<allowedSelectors[0].selectBox.allowedValues.length;n++) {
                    let allowedValue = allowedSelectors[0].selectBox.allowedValues[n];

                    if(event.value === allowedValue.value) {
                        selectionIsAllowed = true;
                    }
                }
            }
            //console.log('\n\nVALUES: selectIsAllowed: ' + selectIsAllowed + ', targetIsSelect: ' + targetIsSelect + ', selectionIsAllowed: ' + selectionIsAllowed);

            if(selectIsAllowed && targetIsSelect && selectionIsAllowed) {
                //console.log('\n\nWILL ALLOW CHANGE')
                changeIsOk = true;
            }
        }
        /*
         * /fix end
         */

        if(tourObj.restrictsAction && !isOk && changeIsOk) {
            event.stopPropagation();
            event.preventDefault();
            /*console.log(' matching case 1')
            console.log(event.target);*/
        } else

        if(currentStepId === 'tool011' && nextStep === 'tool012' && isOk) {
            /*console.log('\n\n----------------------\n\n I should have been able to move on!\n\n----------------------\n\n');
            */
            window.setTimeout(() => {this.props.loadTourStep(nextStep);},500);


        } else if(event.type === 'click' || event.type === 'change') {
            //only resolve event when it's a click

            /*console.log(' matching case 2')*/

            //kill the existing Drop
            //drop.destroy();
            //remove listener


            if(tourEnd) {
                /*console.log(' matching case 2.1')*/
                this.props.closeTour();
            } else if(typeof nextStep !== 'undefined') {
                /*console.log(' matching case 2.2 (loading ' + nextStep + ')')*/

                this.props.loadTourStep(nextStep);
            } else {
                /*console.log('matching case 2.3 (just passing on)')
                console.log(event)*/

            }

            //Special Treatment for Select Boxes
            if(allowedSelectors.length > 0 && event.type === 'click' && allowedSelectors[0].hasOwnProperty('selectBox')) {

                /*console.log(' matching case 2 – select box handling')*/

                document.VideApp = {};
                document.VideApp.openTour = (value) => {

                    let target;

                    for(let n=0; n<allowedSelectors[0].selectBox.allowedValues.length;n++) {
                        let allowedValue = allowedSelectors[0].selectBox.allowedValues[n];

                        if(value === allowedValue.value) {
                            target = allowedValue.state;
                        }
                    }

                    /*console.log(' TOUR: resolving function to load tour')*/

                    if(typeof target !== 'undefined') {
                        /*console.log('DING DONG')*/
                        this.props.loadTourStep(target);
                        return true;
                    } else {
                        /*console.log('DONG DONG')*/
                        this.props.loadTourStep(currentStepId);
                        return true;
                        //return false;
                    }

                }

                //appElem.setAttribute('data-nextTourStep','tool004');

            }

        } else {
            //other event types aren't resolved
            //console.log('passing event on without further action')
            /*console.log(' matching case 3 (passing event of type ' + event.type + ' on)')*/
        }



    }

    /**
     * @param delayCount {number}
     */
    renderTour(delayCount = 0) {

        /*console.log('\n-------renderTour---------')*/

        let stepId = this.props.tour;
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
            return false;
            //throw new TourException(delayCount);
        }

        //let reference = document.querySelector('.editionPreview');
        let popper = document.querySelector('#tourPopper');
        let popperContent = popper.querySelector('.tourContent');
        //render content into popper
        ReactDOM.render(tourObj.content[this.props.language],popperContent);

        let container = document.querySelector('.views');
        let anotherPopper = new Popper(
            targetElem,
            popper,
            {
                // popper options here
                placement: tourObj.attachWhere,
                flip: {
                    behavior: ['left','right','bottom','top']
                }/*,
                preventOverflow: {
                    boundariesElement: container,
                }*/
            }
        );

        /*let drop = new Drop({
            target: targetElem,
            //classes: 'tourDrop',
            //classPrefix: 'tourDrop', //todo: fix classes!!!
            content: div,
            /\*position: 'bottom left',*\/
            openOn: 'always',
            constrainToWindow: true,
            classes: 'drop-theme-arrows tourDrop',
            beforeClose: () => {
                /\*console.log('the drop is supposed to close now… (but I try to prevent that)');
                return false;*\/
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

        this.Drop = drop;
        //window.drop = drop;
        drop.on('close',(e) => {
            this.Drop = null;
        })*/

        return true;
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
