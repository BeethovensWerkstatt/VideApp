import { connect } from 'react-redux';
import { activateEdition } from '../redux/actions.redux';
import EditionList from '../components/EditionList.react';

//these must match the CSS classes
/**
 * @namespace
 */
const EditionListMode = {
    /** horizontal alignment */
    ROW: 'row',
    /** vertical alignment */
    COLUMN: 'column',
    /** responsive(?) alignment */
    GRID: 'grid'
};

const mapStateToProps = (state, ownProps) => {
    return {
        editions: state.edition.editions,
        revision: state.edition.revision,
        highlighted: state.edition.highlighted,
        mode: ownProps.mode
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        onSelect: (editionId) => {
            dispatch(activateEdition(editionId));
        }
    /*onShow: () => {
      dispatch(showSidebar())
    },
    onHide: () => {
      dispatch(hideSidebar())
    }*/
    };
};

/**
 * @module
 */

/**
 * @see {@link EditionListMode}
 */
const EditionListController = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditionList);

export default EditionListController;
export {EditionListMode};
