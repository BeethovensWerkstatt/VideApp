import { connect } from 'react-redux';
import { resetState } from '../redux/actions.redux';
import HomeButton from '../components/HomeButton.react';

const mapStateToProps = (state, ownProps) => {
    return {

    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(resetState());
        }
    };
};

/**
 * @module
 */

/** */
const HomeButtonController = connect(
  mapStateToProps,
  mapDispatchToProps
)(HomeButton);

export default HomeButtonController;
