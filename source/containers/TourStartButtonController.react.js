import { connect } from 'react-redux';
import { loadTourStep } from '../redux/actions.redux';
import TourStartButton from '../components/TourStartButton.react';

const mapStateToProps = (state, ownProps) => {
    return {
        firstStep: ownProps.firstStep
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        loadTourStep: (stepId) => {
            dispatch(loadTourStep(stepId));
        }
    };
};

const TourStartButtonController = connect(
  mapStateToProps,
  mapDispatchToProps
)(TourStartButton);

export default TourStartButtonController;