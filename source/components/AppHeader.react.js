import React, { PropTypes } from 'react';
import LanguageSwitch from '../containers/LanguageSwitch.react';
import PerspectivesBar from './PerspectivesBar.react';

var AppHeader = React.createClass({
    
    getDefaultProps: function () {
        return {
            text: 'Beethovens Werkstatt'
        };
    },
    
    render: function() {
        return (
            <header className='appHeader'>
                <span className='title'>{this.props.text}</span>
                <PerspectivesBar/>
                <div className='languageSwitch'>
                    <LanguageSwitch language='DE' active={true}>DE</LanguageSwitch>
                    {' | '}
                    <LanguageSwitch language='EN'>EN</LanguageSwitch>
                </div>
            </header>
        );
    } 
});

module.exports = AppHeader;