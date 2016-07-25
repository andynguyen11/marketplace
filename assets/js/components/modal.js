import React from 'react'
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'

const ModalInner = React.createClass({
	body: document.body,

	propTypes: {
		open: React.PropTypes.bool,
		onClose: React.PropTypes.func
	},

	closeListener(e) {
		// close modal when user hits escape
		if(e.which ===  27) {
			e.preventDefault();
			this.props.onClose();
		}
	},

	componentDidMount() {
		this.body.classList.add('has-modal');
		window.addEventListener('keydown', this.closeListener);

		/*
		 TODO: Remove this hack when IE10/11 usage is low enough
		 Background: In IE10/11, because of a bug with their implementation of older revisions of the flexbox spec, the overflow:hidden on .modal isn't respected. Forcing a repaint fixes this.
		 */
		if(document.documentMode === 10 || document.documentMode === 11) {
			let el = ReactDOM.findDOMNode(this.refs.modal);
			el.style.height = el.scrollHeight + 'px';
		}
	},

	componentWillUnmount() {
		this.body.classList.remove('has-modal');
		window.removeEventListener('keydown', this.closeListener);
	},

	render() {
		return (
			<div key="modal" className="modal-container">
				<div className="modal-overlay" onClick={this.props.onClose}>
					<div className="modal-close"></div>
				</div>
				<div className="modal" ref="modal">
					<span className="modal-message">{this.props.children}</span>
				</div>
			</div>
		);
	}
});

let Modal = React.createClass({
	render() {
		let modal = this.props.open && <ModalInner {...this.props}/>;

		return (
			<ReactCSSTransitionGroup
				transitionName="modal"
				transitionEnter={true}
				transitionEnterTimeout={250}
				transitionLeave={true}
				transitionLeaveTimeout={250}
				transitionAppear={false}>
				{modal}
			</ReactCSSTransitionGroup>
		);
	}

});

export default Modal
