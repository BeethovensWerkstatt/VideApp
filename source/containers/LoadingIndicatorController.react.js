import { connect } from 'react-redux';
import LoadingIndicator from '../components/LoadingIndicator.react';

/**
 * @module containers/LoadingIndicator
 */

/** */
const mapStateToProps = (state, ownProps) => {
    return {
        requests: state.network.activeRequests
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {

    };
};

const LoadingIndicatorController = connect(
  mapStateToProps,
  mapDispatchToProps
)(LoadingIndicator);

export default LoadingIndicatorController;
