import React from 'react';
import PropTypes from 'prop-types';
import LanguageSwitch from '../containers/LanguageSwitch.react';
import HomeButtonController from '../containers/HomeButtonController.react';
import PerspectivesBar from './PerspectivesBar.react';

/**
 * The REACT header component
 * @extends React.component
 */
class AppHeader extends React.Component {

/**
 * REACT render method returns the header block of the VideApp.
 */
    render() {
        return (
            <header className='appHeader'>
                <HomeButtonController/>
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
};

AppHeader.defaultProps = {
    text: 'Beethovens Werkstatt'
}

module.exports = AppHeader;
