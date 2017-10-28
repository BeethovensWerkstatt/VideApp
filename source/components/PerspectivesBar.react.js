import React from 'react';
import PropTypes from 'prop-types';
import PerspectiveController from '../containers/PerspectiveController.react';
import SyncViewsController from '../containers/SyncViewsController.react';

import {ViewLayouts} from '../redux/layout.constants';

const PerspectivesBar = ({ }) => {
    return (
    <div className="perspectivesBar">
        <PerspectiveController type={ViewLayouts.SINGLE_VIEW} noIntro={true}/>
        <PerspectiveController type={ViewLayouts.VERTICAL_SPLIT} noIntro={true}/>
        <PerspectiveController type={ViewLayouts.HORIZONTAL_SPLIT} noIntro={true}/>
        <SyncViewsController/>
    </div>
    
    );
};


PerspectivesBar.propTypes = {
  
};

export default PerspectivesBar;