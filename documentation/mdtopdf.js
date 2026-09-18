const { mdToPdf } = require('md-to-pdf');

(async () => {
	const pdf = await mdToPdf(
		{ path: 'AUVEN_User_Documentation.md' },
		{ dest: 'AUVEN_User_Documentation.pdf' },
		{
			launch_options: {
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			}
		}
	).catch(console.error);

	if (pdf) {
		console.log('PDF created successfully');
	}
})();
