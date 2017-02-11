import React, { PropTypes } from 'react';
import PerspectiveController from '../containers/PerspectiveController.react';

import {ViewLayouts} from '../redux/layout.constants';

const PerspectivesBar = ({ }) => {
    return (
    <div className="perspectivesBar">
        <PerspectiveController type={ViewLayouts.SINGLE_VIEW} noIntro={true}/>
        <PerspectiveController type={ViewLayouts.VERTICAL_SPLIT} noIntro={true}/>
        <PerspectiveController type={ViewLayouts.HORIZONTAL_SPLIT} noIntro={true}/>        
    </div>
    
    );
};


PerspectivesBar.propTypes = {
  
};

export default PerspectivesBar;