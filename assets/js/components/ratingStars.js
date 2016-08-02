import React from 'react';

const RatingStars = React.createClass({
    propTypes: {
        rating: React.PropTypes.number.isRequired,
        color: React.PropTypes.string
    },

    render() {
        const { rating, color } = this.props;
        // change default to yellow later
        const stars = function(){
            const starsArray = [];
            const starBaseClass = ' ratingStars-star';
            const starClassWithColor = color ? starBaseClass + '-' + color : '';

            for(let i = 0; i < 5; i++) {
                const starBrightClass = starBaseClass + '--selected';
                const starClass = i < rating && starClassWithColor + starBrightClass || starClassWithColor;
                starsArray.push(<i className={"fa fa-star" + starBaseClass + starClass} aria-hidden="true" key={i}></i>);
            }

            return starsArray;
        }();

        return (
            <div className='ratingStars'>
                {stars}
            </div>
        );
    }
});

export default RatingStars;