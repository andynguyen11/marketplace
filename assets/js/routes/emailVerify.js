(function() {
	const $btn = $('.emailVerify-resend');
	const userId = $btn.data('userId');
	const resend = () => {
		$btn.attr('disabled', true).text('Sending...');

		$.ajax({
			url: '/api/profile/' + userId + '/send_confirmation_email',
			method: 'GET',
			success() {
				$btn.text('Sent!');
			},
			fail() {
				$btn.attr('disabled', false).text('Resend email');
			}
		});
	}

	$btn.on('click', resend);
})();