var React = require('react');
var AppHeader = require('./AppHeader.react');

import ViewsController from '../containers/ViewsController.react';


/*var AppFooter = require('./AppFooter.react');

import ContextMenuController from '../containers/ContextMenuController.react';

import PerspectivesBar from './PerspectivesBar.react';
import BookmarksPane from '../containers/BookmarksPane.react';
import ViewsController from '../containers/ViewsController.react';
import EditionTitleController from '../containers/EditionTitleController.react';
import SupportedViewsListController from '../containers/SupportedViewsListController.react';
import I18n from '../containers/I18n.react';
*/

var Application = React.createClass({
    
    render: function() {
        return (
            <div className='appContainer'>
                <AppHeader text="Beethovens Werkstatt"/>
                <ViewsController/>
            </div>
            
        );
    } 
});

module.exports = Application;

/* 
 * 
                
                <ViewsController/>
                
                <AppFooter/>
                <ContextMenuController/>
 */