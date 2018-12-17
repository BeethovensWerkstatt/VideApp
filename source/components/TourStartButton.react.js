import React from 'react';
import PropTypes from 'prop-types';

/**
 * @param loadTourStep {function}
 * @param firstStep {string}
 * @class
 */
const TourStartButton = ({ loadTourStep, firstStep }) => {

    return (
        <span className='tourStartButton'
           onClick={e => {
               e.preventDefault();
               loadTourStep(firstStep);
           }}
        >Tour</span>
    );
};

TourStartButton.propTypes = {
    loadTourStep: PropTypes.func.isRequired,
    firstStep: PropTypes.string.isRequired
};

export default TourStartButton;
