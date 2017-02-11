import { connect } from 'react-redux';
import { activateEdition, highlightEdition } from '../redux/actions.redux';
import VIDE_PROTOCOL from '../_modules/vide-protocol';
import EditionListEntry from '../components/EditionListEntry.react';

const mapStateToProps = (state, ownProps) => {
    return {
        edition: ownProps.edition,
        highlighted: ownProps.highlighted,
        noneHighlighted: ownProps.noneHighlighted
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onSelect: () => {
            if(ownProps.highlighted) {
                dispatch(activateEdition(ownProps.edition.id));      
            } else {
                dispatch(highlightEdition(ownProps.edition.id));
            }
        }
    };
};

const EditionListEntryController = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditionListEntry);

export default EditionListEntryController;