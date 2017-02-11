import { connect } from 'react-redux';
import { switchLanguage } from '../redux/actions.redux';
import I18nString from '../components/I18nString.react';

const mapStateToProps = (state, ownProps) => {
    return {
        lang : state.preferences.language,
        content: ownProps.content,
        tooltip: ownProps.tooltip
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
    /*onShow: () => {
      dispatch(showSidebar())
    },
    onHide: () => {
      dispatch(hideSidebar())
    }*/
    };
};

const I18n = connect(
  mapStateToProps,
  mapDispatchToProps
)(I18nString);

export default I18n;