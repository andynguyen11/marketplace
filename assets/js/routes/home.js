(function() {
	let Modal = require('../components/modal');
	let modalDiv;

	const addModalContainer = () => {
		let body = document.body;

		modalDiv = document.createElement('div');
		modalDiv.id = 'dq-modal';

		body.appendChild(modalDiv);

		// to remove the React component from the page (and memory) entirely, call:
		// React.unmountComponentAtNode(modalDiv)
	};

	addModalContainer();

	$('#writeReview').on('click', () => {
		const reviewsDummyData = {
			reviewee: {
				firstName: 'Taylor',
				lastName: 'Swift',
				avatar: 'http://cdn.playbuzz.com/cdn/047efb51-0503-4a2f-853c-9641a70b05ba/c0fb9faa-4bc0-4088-8754-35247de61540_560_420.jpg'
			},
			project: {
				projectName: 'Bad Blood',
				projectId: 1234
			}
		};

		const ModalContent = React.createClass({
			getInitialState() {
				return {
					ratings: {
						'Availability': 0,
						'Timeliness': 0,
						'Quality': 0,
						'Skill': 0,
						'Deadlines': 0,
						'Communication': 0
					},
					modalOpen: false,
					error: false,
					submitting: false
				}
			},

			componentDidMount() {
				// Ideally this wouldn't live here, but until we're using React in more places, this is probably the best approach
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

			setRating(attribute, rating) {
				const { ratings } = this.state;

				ratings[attribute] = rating;

				this.setState({
					ratings,
					error: false,
					submitting: false
				});
			},

			submitReview() {
				/*
					- do an $.ajax call to the server
					- in the success callback, call this.closeModal();
					- in the error callback, call this.setState({ error: true });
				*/

				this.setState({
					error: true,
					submitting: true
				})
			},

			render(){
				const { reviewee: { firstName, avatar }, project: { projectName } } = this.props;
				const { ratings, modalOpen, error, submitting } = this.state;

				const headerText = <span>Review of <a href="" className="bold">{firstName}'s</a> work on <a href="" className="bold">{projectName}</a></span>;
				const userAvatar = (
					<div className="submitReview-user-avatar" style={ { backgroundImage: 'url(' + avatar + ')' } }></div>
				);
				const ratingAttributeComponents = Object.keys(ratings).map((attribute, i) => {
					const rating = ratings[attribute];
					const stars = [5, 4, 3, 2, 1].map((value) => {
						const rate = () => {
							this.setRating(attribute, value);
						};
						let className = 'submitReview-attribute-star';

						if(rating >= value) {
							className += ' submitReview-attribute-star-selected';
						}

						return <div className={className} key={'star-' + value} onClick={rate}></div>;
					});

					return (
						<div className="submitReview-attribute" key={'attribute-' + i}>
							<div className="submitReview-attribute-name">{attribute}</div>
							<div className="submitReview-attribute-stars">
								{stars}
							</div>
						</div>
					)
				});
				const errorComponent = error && <div className="alert alert-danger submitReview-error" role="alert">Oops! Something went wrong.</div>;

				return (
					<Modal open={modalOpen} onClose={this.closeModal}>
						<div className="submitReview-modal">
							<div className="submitReview-header">
								{headerText}
								{userAvatar}
							</div>
							<div className="submitReview-attributes">
								{ratingAttributeComponents}
							</div>
							<div className="submitReview-reviewText">
								<textarea name="submitReview-textarea" placeholder="Write your review here..."></textarea>
							</div>
							{errorComponent}
							<div className="submitReview-footer">
								<div className="submitReview-recommendation">
									<label htmlFor="wouldRecommend">
										<label className="submitReview-recommend-true">
											<input type="radio" name="wouldRecommend" value="true"/>
											I would work with {firstName} again.
										</label>
										<label className="submitReview-recommend-false">
											<input type="radio" name="wouldRecommend" value="false"/>
											I would not work with {firstName} again.
										</label>
									</label>
								</div>
								<div className="submitReview-submit">
									<button className="btn btn-yellow btn-lg submitReview-button" disabled={submitting} onClick={this.submitReview}>Submit Review</button>
								</div>
							</div>
						</div>
					</Modal>
				)
			}
		});

		ReactDOM.render(<ModalContent {...reviewsDummyData} />, modalDiv);
	});
})();