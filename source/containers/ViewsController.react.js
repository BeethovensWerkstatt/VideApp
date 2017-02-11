import { connect } from 'react-redux';
import { setViewRatio } from '../redux/actions.redux';
import Views from '../components/Views.react';

const mapStateToProps = (state, ownProps) => {
    return {
        firstView : state.views.view1,
        secondView : state.views.view2,
        layout: state.views.layout,
        viewRatio: state.views.ratio,
        edition : state.edition.active,
        language: state.preferences.language
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        setRatio: (ratio) => {
            dispatch(setViewRatio(ratio));
        }
    /*onShow: () => {
      dispatch(showSidebar())
    },
    onHide: () => {
      dispatch(hideSidebar())
    }*/
    };
};

const ViewsController = connect(
  mapStateToProps,
  mapDispatchToProps
)(Views);

export default ViewsController;