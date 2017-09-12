import { connect } from 'react-redux';
import Tour from '../components/Tour.react';

const mapStateToProps = (state, ownProps) => {
    return {
        tour: state.tour
    };
};

const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        
    };
};

const TourController = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tour);

export default TourController;