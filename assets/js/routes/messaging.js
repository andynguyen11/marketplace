import React from 'react';

(function() {
	let Modal = require('../components/modal');
	let modalDiv;

	const addModalContainer = () => {
		let body = document.body;

		modalDiv = document.createElement('div');
		modalDiv.id = 'loom-nda-modal';

		body.appendChild(modalDiv);

		// to remove the React component from the page (and memory) entirely, call:
		// React.unmountComponentAtNode(modalDiv)
	};

	addModalContainer();

	$('#signNDA').on('click', (e) => {
    e.preventDefault();

		const NDAModalContent = React.createClass({
			getInitialState() {
				return {
					modalOpen: true,
					submitting: false
				}
			},

      componentDidMount() {
				// Will need to do this profile get on parent component
        this.openModal();
			},


			openModal() {
				this.setState({
					modalOpen: true
				})
			},

			closeModal() {
				this.setState({
					modalOpen: false
				})
			},

			signNDA() {
        let nda_id = $('#signNDA').data('nda');
        $.ajax({
          url: loom_api.nda + nda_id + '/',
          type: 'PATCH',
          data: JSON.stringify({
            id: nda_id,
            signed: true
          }),
          success: function(data, textStatus, jqXHR) {
            this.closeModal();
          }.bind(this)
        });
			},

			render(){
				const { modalOpen, submitting } = this.state;

				return (
					<Modal open={modalOpen} onClose={this.closeModal}>
						<div className="nda-modal">
							<div className="nda-header">
								Sign NDA
							</div>
							<div className="nda-text">
								Lorem ipsum nda stuff
                <input type="checkbox" className="form-control" /> I agree to the Non-Disclosure Agreement
							</div>
							<div className="nda-footer">
								<div className="nda-submit">
									<button className="btn btn-yellow btn-lg nda-button" disabled={submitting} onClick={this.signNDA}>Sign NDA</button>
								</div>
							</div>
						</div>
					</Modal>
				)
			}
		});

		ReactDOM.render(<NDAModalContent />, modalDiv);
	});
})();