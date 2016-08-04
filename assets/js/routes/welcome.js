import React from 'react';
import ReactDOM from 'react-dom';

(function(){
    const welcomeDiv = document.getElementById('welcome');

    const Welcome = React.createClass({
        render() {

            return (
                <div className="welcome">
                    <a href="" className="logo">Loom</a>
                    <div className="welcome-content">
                        <div className="welcome-content-inner">
                            <h1 className="welcome-header">
                                Welcome,<br/>
                                Design Within Reach
                            </h1>
                            <p className="welcome-paragraph">
                                We’d love to help connect you with developers to bring your product to life in exchange for cash or equity.
                            </p>
                            <a href="" className="btn btn-brand btn-brand--attn">Post your project</a>
                        </div>
                    </div>
                    <div className="welcome-splash">
                        <div className="welcome-overlay"></div>
                        splash
                    </div>
                </div>
            );
        }
    });

    ReactDOM.render(<Welcome/>, welcomeDiv);
})();