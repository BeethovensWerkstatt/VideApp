import { connect } from 'react-redux';
import { switchLanguage } from '../redux/actions.redux';
import Link from '../components/Link.react';

const mapStateToProps = (state, ownProps) => {
    return {
        active: ownProps.language.toLowerCase() === state.preferences.language
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onClick: () => {
            dispatch(switchLanguage(ownProps.language.toLowerCase()));
        }
    };
};

const LanguageSwitch = connect(
  mapStateToProps,
  mapDispatchToProps
)(Link);

export default LanguageSwitch;