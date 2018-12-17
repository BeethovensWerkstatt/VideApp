import { connect } from 'react-redux';
import { ViewLayouts } from '../redux/layout.constants';
import { setSyncViews } from '../redux/actions.redux';
import SyncViewsButton from '../components/SyncViewsButton.react';

/**
 * @module containers/SyncViewsController
 */

/** */
const mapStateToProps = (state, ownProps) => {
    return {
        hidden: state.views.layout !== ViewLayouts.HORIZONTAL_SPLIT
            && state.views.layout !== ViewLayouts.VERTICAL_SPLIT,
        synced: state.views.synced

    };
};

/** */
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: (bool) => {
            dispatch(setSyncViews(bool));
        }
    };
};

/** @class */
const SyncViewsController = connect(
  mapStateToProps,
  mapDispatchToProps
)(SyncViewsButton);

export default SyncViewsController;
