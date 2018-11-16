import React from 'react';
import PropTypes from 'prop-types';
import View from './View.react';
import Introduction from './Introduction.react';
import { ViewLayouts } from './../redux/layout.constants';
import SplitPane from 'react-split-pane';

/**
 * INFO
 *
 * cap of viewRatio to be .1 <= viewRatio <= .9 also enforced in reducers.redux.js
 * @module components/Views
 */

/** */
const Views = ({ view1, view2, layout, synced, viewRatio, edition, revision, language, setRatio }) => {
    if(layout === ViewLayouts.SINGLE_VIEW) {
        return (
        <div className="views">
            <View view={view1} pos="view1" edition={edition} revision={revision} language={language} layout={layout}/>
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
                <View view={view1} otherView={view2} synced={synced} pos="view1" edition={edition} revision={revision} language={language} layout={layout}/>
                <View view={view2} otherView={view1} synced={synced} pos="view2" edition={edition} revision={revision} language={language} layout={layout}/>
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
                <View view={view1} otherView={view2} synced={synced} pos="view1" edition={edition} revision={revision} language={language} layout={layout}/>
                <View view={view2} otherView={view2} synced={synced} pos="view2" edition={edition} revision={revision} language={language} layout={layout}/>
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
    view1: PropTypes.object.isRequired,
    view2: PropTypes.object.isRequired,
    layout: PropTypes.string.isRequired,
    synced: PropTypes.bool.isRequired,
    viewRatio: PropTypes.number.isRequired,
    edition: PropTypes.string.isRequired,
    revision: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    setRatio: PropTypes.func.isRequired
};

export default Views;
