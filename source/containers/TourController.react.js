import { connect } from 'react-redux';
import Tour from '../components/Tour.react';
import { loadTourStep, closeTour } from '../redux/actions.redux';

/**
 * @module containers/TourController
 */

/** */
const mapStateToProps = (state, ownProps) => {
    return {
        tour: state.tour,
        language: state.preferences.language,
        nolog: state.network.nolog,
        fullState: state
    };
};

/** */
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadTourStep: (stepId) => {
            dispatch(loadTourStep(stepId));
        },
        closeTour: () => {
            dispatch(closeTour());
        }
    };
};

/** @class */
const TourController = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tour);

export default TourController;
