import { connect } from 'react-redux';
import LoadingIndicator from '../components/LoadingIndicator.react';

const mapStateToProps = (state, ownProps) => {
    return {
        requests: state.network.activeRequests
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {

    };
};

/**
 * @module
 */

/** */
const LoadingIndicatorController = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadingIndicator);

export default LoadingIndicatorController;
