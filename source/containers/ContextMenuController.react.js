import { connect } from 'react-redux';
import { openContextMenu, closeContextMenu } from '../redux/actions.redux';
import {eohub} from './../_modules/eo-hub';
import ContextMenu from '../components/ContextMenu.react';

const mapStateToProps = (state, ownProps) => {
    return {
        items: state.contextMenu.items,
        visible: state.contextMenu.visible,
        x: state.contextMenu.x,
        y: state.contextMenu.y
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        closeContextMenu: () => {
            dispatch(closeContextMenu());
        },
        submitRequest: (item) => {
            try {
                console.log('--------now what to do with this item:')
                console.log(item)
                eohub.broadcastRequest(item);    
            } catch(err) {
                console.log('[ERROR] Unable to submit request: ' + err);
            }
        //dispatch(closeContextMenu())
        }
    
    /*onShow: () => {
      dispatch(showSidebar())
    },
    onHide: () => {
      dispatch(hideSidebar())
    }*/
    };
};

const ContextMenuController = connect(
  mapStateToProps,
  mapDispatchToProps
)(ContextMenu);

export default ContextMenuController;