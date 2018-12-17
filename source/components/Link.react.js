import React from 'react';
import PropTypes from 'prop-types';

/**
 * This element defines a link.
 * @param active {bool}
 * @param children {node}
 * @param onClick {function}
 * @class
 */
const Link = ({ active, children, onClick }) => {
    if (active) {
        return <span><strong>{children}</strong></span>;
    }

    return (
    <a href="#"
       onClick={e => {
           e.preventDefault();
           onClick();
       }}
    >
      {children}
    </a>
    );
};

Link.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired
};

export default Link;
