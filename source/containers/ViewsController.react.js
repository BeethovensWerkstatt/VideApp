import { connect } from 'react-redux';
import { setViewRatio } from '../redux/actions.redux';
import Views from '../components/Views.react';

const mapStateToProps = (state, ownProps) => {
    return {
        view1 : state.views.view1,
        view2 : state.views.view2,
        layout: state.views.layout,
        viewRatio: state.views.ratio,
        edition : state.edition.active,
        revision: state.edition.revision,
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