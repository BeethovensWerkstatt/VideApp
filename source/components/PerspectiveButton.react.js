import React from 'react';
import PropTypes from 'prop-types';
import { ViewLayouts } from '../redux/layout.constants';

/**
 * @module components/PerspectiveButton
 */

/** */
const PerspectiveButton = ({ active, type, hidden, onClick }) => {
    const classString = 'perspectiveButton' + (active ? ' active ' : ' ') + type + (hidden ? ' hidden':'');

    var content;
    if(type === ViewLayouts.INTRODUCTION) {
        content = <i className="fa fa-home"></i>;
    /*} else if(type === STEMMA) {
        content = <i className="fa fa-sitemap"></i>;*/
    } else if(type === ViewLayouts.SINGLE_VIEW) {
        content = <i className="fa fa-stop"></i>;
    } else if(type === ViewLayouts.VERTICAL_SPLIT) {
        content = <i className="fa fa-pause fa-rotate-90"></i>;
    } else if(type === ViewLayouts.HORIZONTAL_SPLIT) {
        content = <i className="fa fa-pause"></i>;
    }


    return (
    <div className={classString}
        onClick={e => {
            e.preventDefault();
            onClick(type);
        }}>
        {
            content
        }
    </div>

    );
};


PerspectiveButton.propTypes = {
    active: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
    hidden: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired

};

export default PerspectiveButton;
