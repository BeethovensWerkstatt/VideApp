import React, { PropTypes } from 'react';

const HomeButton = ({ onClick }) => {
    
    return (
    <img src='./resources/pix/videAppLogo.png' className='videAppLogo' alt='Home'
       onClick={e => {
           e.preventDefault();
           onClick();
       }}
    />
    );
};

HomeButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

export default HomeButton;