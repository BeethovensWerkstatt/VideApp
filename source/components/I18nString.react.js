import React from 'react';
import PropTypes from 'prop-types';

/** localization in (<i>$FILE</i>) */
var langfile = require('../i18n/i18n.json');

/**
 * @param lang {string}
 * @param content {string}
 * @param tooltip {string}
 * @class
 */
const I18nString = ({ lang, content, tooltip }) => {
    if(typeof content !== 'undefined' && typeof tooltip !== 'undefined') {
        if(!langfile.hasOwnProperty(content)) {
            const tip = 'Unable to retrieve content from "' + content + '" in i18n.json';
            return <span className="i18n error" title={tip}>ERROR (i18n)</span>;
        }

        if(!langfile.hasOwnProperty(tooltip)) {
            const tip = 'Unable to retrieve tooltip from "' + tooltip + '" in i18n.json';
            return <span className="i18n error" title={tip}>ERROR (i18n)</span>;
        }

        const contentString = langfile[content][lang];
        const tooltipString = langfile[tooltip][lang];

        return <span className="i18n" title={tooltipString}>{contentString}</span>;
    } else if(typeof content !== 'undefined') {
        if(!langfile.hasOwnProperty(content)) {
            const tip = 'Unable to retrieve content from "' + content + '" in i18n.json';
            return <span className="i18n error" title={tip}>ERROR (i18n)</span>;
        }

        const contentString = langfile[content][lang];

        return <span className="i18n">{contentString}</span>;
    }

    //fallback
    return <span className="i18n error" title="The content to be translated has not been specified.">ERROR (i18n)</span>;
};


I18nString.propTypes = {
    lang: PropTypes.string.isRequired,
    content: PropTypes.string,
    tooltip: PropTypes.string
};

export default I18nString;
