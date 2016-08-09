import React from 'react';
import ReactDOM from 'react-dom';
import RatingStars from '../components/ratingStars';
import BigSelect from '../components/bigSelect';

(function(){
    // const developersDiv = document.getElementById('devs-home');

    const HomeDevelopers = React.createClass({
        componentWillMount() {
            // this is just for dev, Andy is the only dev that has data :-O
            const devData = [
                {
                    first_name: 'Andy',
                    photo: 'https://devquity.s3.amazonaws.com/profile/andy.jpg',
                    rating: 5,
                    type: 'back-end',
                    availability: 20,
                    id: 12345
                },
                {
                    first_name: 'Taylor',
                    photo: 'http://static.independent.co.uk/s3fs-public/thumbnails/image/2016/01/29/11/Taylor-Swift-revenge-nerds.jpg',
                    rating: 4,
                    type: 'full stack',
                    availability: 10,
                    id: 12345
                },
                {
                    first_name: 'Rick',
                    photo: 'https://scontent-atl3-1.xx.fbcdn.net/t31.0-8/11050731_10106291266697984_6757965998273098672_o.jpg',
                    rating: 3,
                    type: 'front-end',
                    availability: 8,
                    id: 12345
                },
                {
                    first_name: 'Hillary',
                    photo: 'http://i2.cdn.turner.com/cnnnext/dam/assets/150410133757-04-hillary-clinton-homepage-large-169.jpg',
                    rating: 4,
                    type: 'front-end',
                    availability: 30,
                    id: 12345
                }
            ];

            const devOptions = [
                'front-end',
                'back-end',
                'full stack'
            ];

            this.setState({
                developers: devData,
                devOptions
            });
        },

        render() {
            const { developers, devOptions } = this.state;
            const developerPlates = developers.map((dev, i) => {
                const photoUrl = dev.photo || 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Asimo_look_new_design.jpg';

                return (
                    <a className='plate plate--dev' href='#' key={i}>
                        <div className='plate--dev-profile-overlay' style={ { backgroundImage: "url(" + photoUrl + ")" } }></div>
                        <div className='plate--dev-type'>{ dev.type }</div>
                        <div className='plate--dev-info'>
                            <div className="plate--dev-info-profile-photo" style={ { backgroundImage: "url(" + photoUrl + ")" } }></div>
                            <div className="plate--dev-info-rating"><RatingStars rating={dev.rating} color="white" /></div>
                            <div className="plate--dev-info-availability">{ dev.availability }hrs / week</div>
                            <div className="plate--dev-info-hire-button btn btn-white--clear">Hire { dev.first_name }</div>
                        </div>
                    </a>
                );
            });

            return (
                <div className='plates page-content--medium'>
                    <BigSelect className="home-dev-bigSelect" options={devOptions} selectedOptionIndex={0} prefix="Meet your" suffix="developer" />
                    <div className='plates-headcap plates-headcap--noHeader home-headcap--bigSelect'>
                        <a href='#' className='btn btn--clear btn-lg'>See more</a>
                    </div>
                    <div className='plates-inner plates-inner--dev'>
                        {developerPlates}
                    </div>
                </div>
            );
        }
    });

    ReactDOM.render(<HomeDevelopers />, developersDiv);
})();
