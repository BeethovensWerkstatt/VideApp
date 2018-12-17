import { connect } from 'react-redux';
import { ViewLayouts } from '../redux/layout.constants';
import { setViewLayout, deActivateEdition } from '../redux/actions.redux';
import PerspectiveButton from '../components/PerspectiveButton.react';

const mapStateToProps = (state, ownProps) => {
    return {
        active: ownProps.type === state.views.layout,
        hidden: ownProps.noIntro && state.views.layout === ViewLayouts.INTRODUCTION
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: (type) => {
            if(type === ViewLayouts.INTRODUCTION) {
                dispatch(deActivateEdition());
            } else if(type === ViewLayouts.VERTICAL_SPLIT) {
                dispatch(setViewLayout(ViewLayouts.VERTICAL_SPLIT));
            } else if(type === ViewLayouts.HORIZONTAL_SPLIT) {
                dispatch(setViewLayout(ViewLayouts.HORIZONTAL_SPLIT));
            } else if(type === ViewLayouts.SINGLE_VIEW) {
                dispatch(setViewLayout(ViewLayouts.SINGLE_VIEW));
            }
        }
    };
};

/**
 * @module
 */

/** */
const PerspectiveController = connect(
  mapStateToProps,
  mapDispatchToProps
)(PerspectiveButton);

export default PerspectiveController;
