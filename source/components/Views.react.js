import React, { PropTypes } from 'react';
import View from './View.react';
import Introduction from './Introduction.react';
import { ViewLayouts } from './../redux/layout.constants';
import SplitPane from 'react-split-pane';

/* 
 * INFO
 * 
 * cap of viewRatio to be .1 <= viewRatio <= .9 also enforced in reducers.redux.js
 */

const Views = ({ firstView, secondView, layout, viewRatio, edition, language, setRatio }) => {
    
    if(layout === ViewLayouts.SINGLE_VIEW) {
        return (
        <div className="views">
            Und hier geht es dann weiter… TODO in Views.react.js
        </div>
        );
    } else if(layout === ViewLayouts.HORIZONTAL_SPLIT) {
        let size = Math.round(viewRatio * 100) + '%';
        let fullWidth = document.getElementsByClassName('views')[0].clientWidth;
        
        return (
        <div className="views">
            <SplitPane size={size} minSize={fullWidth / 10} maxSize={fullWidth / -10} split="vertical" onDragFinished={ (newSize) => {
                let newRatio = newSize / fullWidth;
                setRatio(newRatio);
            }}>
                <div>Horizontal Pane 1</div>
                <div>Horizontal Pane 2</div>
            </SplitPane>
        </div>
        );
    } else if(layout === ViewLayouts.VERTICAL_SPLIT) {
        let size = Math.round(viewRatio * 100) + '%';
        let fullHeight = document.getElementsByClassName('views')[0].clientHeight;
        
        return (
        <div className="views">
            <SplitPane size={size} minSize={fullHeight / 10} maxSize={fullHeight / -10} split="horizontal" onDragFinished={ (newSize) => {
                let newRatio = newSize / fullHeight;
                setRatio(newRatio);
            }}>
                <div>Vertical Pane 1</div>
                <div>Vertical Pane 2</div>
            </SplitPane>  
        </div>
        );
    } else if(layout === ViewLayouts.INTRODUCTION) {
        return (
            <div className="views">
                <Introduction language={language}/>
            </div>
        );  
    } 
    
    console.log('[ERROR] Something is wrong with ' + layout + ' in Views.react.js');
};

Views.propTypes = {
    firstView: PropTypes.object.isRequired,
    secondView: PropTypes.object.isRequired,
    layout: PropTypes.string.isRequired,
    viewRatio: PropTypes.number.isRequired,
    edition: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    setRatio: PropTypes.func.isRequired
};

export default Views;