import React, { PropTypes } from 'react';
import { ViewLayouts } from './../redux/layout.constants';

const ViewSplitter = ({ layout, viewRatio }) => {
    if(layout === ViewLayouts.VERTICAL_SPLIT) {
        return (
            <div className="viewSplitter vertical" style={{top: viewRatio * 100 + '%'}}></div>
        );
    } else if(layout === ViewLayouts.HORIZONTAL_SPLIT) {
        return (
            <div className="viewSplitter horizontal" style={{left: viewRatio * 100 + '%'}}></div>
        );
    }
    
    return null;
};

ViewSplitter.propTypes = {
    layout: PropTypes.string.isRequired,
    viewRatio: PropTypes.number.isRequired
};

export default ViewSplitter;