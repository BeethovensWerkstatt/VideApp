import { connect } from 'react-redux';
import Tour from '../components/Tour.react';
import { loadTourStep, closeTour } from '../redux/actions.redux';

const mapStateToProps = (state, ownProps) => {
    return {
        tour: state.tour,
        language: state.preferences.language
    };
};

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

const TourController = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tour);

export default TourController;