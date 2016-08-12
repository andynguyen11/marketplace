import React from 'react';
import ReactDOM from 'react-dom';
import { createHashHistory } from 'history';
import { Router, Route, IndexRoute, IndexRedirect, Link, useRouterHistory } from 'react-router';

(function(){
	const aboutDiv = document.getElementById('about');

	const TopNav = React.createClass({
		render() {
			const { routes, currentRoute } = this.props;

			const navLinks = routes.map((route, i) => {
				const linkActive = route.pathname === currentRoute.pathname ? 'active' : '';

				return (
					<li key={i}>
            { route.href ?
            <a href={route.href} target='_blank'>{route.title}</a>
            :
            <Link className={linkActive} to={route.pathname} >{route.title}</Link>
            }

					</li>
				)
			});

			return (
				<div className="account-nav">
					<div className="row">
						<div className="container">
							<ul>
								{navLinks}
							</ul>
						</div>
					</div>
				</div>
			);
		}
	});

	const LeftNav = React.createClass({
		render() {
			const { pathname, childRoutes } = this.props;

			const leftNavLinks = childRoutes.map((childRoute, i) => {
				const linkActive = pathname === childRoute.pathname ? 'active' : '';

				return (
					<li key={i}>
          { childRoute.href ?
            <a href={childRoute.href} target='_blank'>{childRoute.title}</a>
            :
            <Link className={linkActive} to={childRoute.pathname} >{childRoute.title}</Link>
          }
					</li>
				)
			});


			return (
				<ul className="left-nav">
					{leftNavLinks}
				</ul>
			);
		}
	});

	const AboutPage = React.createClass({
		render() {
			const { pathname } = this.props.location;
			const routes = [
				{
					title: 'About Loom',
					pathname: '/company',
					childRoutes: [
						{
							title: 'About',
							pathname: '/company',
              href: ''
						},
						{
							title: 'Careers',
							pathname: '/company/careers',
              href: ''
						},
            {
              title: 'Press',
              pathname: '',
              href: 'http://loom.totemapp.com/'
            },
            {
              title: 'Support',
              pathname: '',
              href: 'http://support.joinloom.com/'
            },
            {
              title: 'Terms of Service',
              pathname: '/company/terms-of-service',
              href: ''
            },
            {
              title: 'Privacy Policy',
              pathname: '/company/privacy',
              href: ''
            },
            {
              title: 'DMCA Policy',
              pathname: '/company/dmca',
              href: ''
            },
            {
              title: 'Contact',
              pathname: '/company/contact',
              href: ''
            }
					]
				},
				{
					title: 'Freelancing on Loom',
					pathname: '',
          href: 'https://joinloom.zendesk.com/hc/en-us/categories/203556327-Help-with-Freelancing-on-Loom'
				},
				{
					title: 'Hiring on Loom',
					pathname: '',
          href: 'https://joinloom.zendesk.com/hc/en-us/categories/203556347-Help-with-Hiring-on-Loom'
				},
        {
					title: 'Loom Support Center',
					pathname: '',
          href: 'https://joinloom.zendesk.com/hc/en-us'
				}
			];

			let currentRoute;

			routes.map((route) => {
				if(route.pathname === pathname) {
					currentRoute = route;
				}

				if(route.childRoutes) {
					route.childRoutes.map((childRoute) => {
						if (childRoute.pathname === pathname) {
							currentRoute = route;
						}
					})
				}
			});

			const containerComponent = currentRoute.childRoutes ? (
				<div>
					<div className="col-md-2">
						<LeftNav pathname={pathname} childRoutes={currentRoute.childRoutes}/>
					</div>
					<div className="col-md-10">
							{this.props.children}
					</div>
				</div>
			) : (
				<div className="col-md-12">{this.props.children}</div>
			)

			return (
				<div id="about-us">

					<TopNav routes={routes} currentRoute={currentRoute}/>

					<div className="row about-content">
						<div className="container">
							{containerComponent}
						</div>
					</div>

				</div>
			)
		}
	});

  const Terms = React.createClass({
    render() {
      return (
        <div>
          <h2>Terms of Service</h2>
          <p><strong>Loom Terms of Service</strong></p>

          <p>Last updated: August 8, 2016</p>

          <p>Welcome to<strong> Loom</strong>. Loom<strong> </strong>is an independent platform through which companies (“<strong>Companies</strong>”) can connect and engage independent contractors (“<strong>Contractors</strong>”) for web development and other services (the “<strong>Development Services</strong>”). The website at www.joinloom.com (the “<strong>Site</strong>”) and the various other related services, features, functions, software, applications, websites and networks (together with the Site, collectively, the “<strong>Loom Services</strong>”) are provided and operated, and are being made available to you, your organization (the “<strong>Organization</strong>”), Contractors, Companies and the other users of any of the Loom Services (collectively, “<strong>Users</strong>”) by Loom Labs, Inc.<strong> </strong>(“<strong>Loom</strong>”). All defined terms used herein shall have the meanings prescribed to these terms in these Terms of Service.</p>

          <p><strong>IMPORTANT! THESE TERMS OF SERVICE (“TERMS”) GOVERN YOUR USE OF THE SITE AND THE OTHER LOOM SERVICES.&nbsp; BY CLICKING “I AGREE”, DOWNLOADING, USING, CONFIGURING OR ACCESSING THE SITE OR ANY OF THE OTHER LOOM SERVICES OR THE DEVELOPMENT SERVICES, OR OTHERWISE SIGNIFYING YOUR ACCEPTANCE OF THESE TERMS, YOU REPRESENT AND WARRANT THAT (A) YOU ARE AUTHORIZED TO ENTER THESE TERMS OF SERVICE FOR AND ON BEHALF OF YOURSELF AND YOUR ORGANIZATION, AND ARE DOING SO, (B) YOU AND YOUR ORGANIZATION CAN LEGALLY ENTER INTO THESE TERMS AND (C) YOU HAVE READ AND UNDERSTAND AND AGREE THAT YOU, THE ORGANIZATION AND EACH USER SHALL BE BOUND BY THESE TERMS OF SERVICE AND LOOM’S PRIVACY POLICY (HTTP://JOINLOOM.COM/PRIVACY/) (THE “PRIVACY POLICY”) AND ALL MODIFICATIONS AND ADDITIONS PROVIDED FOR. IF YOU DO NOT AGREE TO THESE TERMS OF SERVICE OR THE PRIVACY POLICY, PLEASE DO NOT USE ANY OF THE LOOM SERVICES.</strong></p>

          <p><strong>1. Eligibility.&nbsp;</strong></p>

          <p>To access and use the Site and the other Loom Services and the Development Services, you must be at least 18 years of age. By engaging any Contractor, by posting or bidding on any Development Services or performing or receiving any Development Services, clicking the “I Agree” button or by downloading, installing or otherwise accessing or using any of the Loom Services, you represent that:&nbsp;</p>

          <p>You satisfy the eligibility requirements and have not been previously suspended or removed from the Site or any of the other Loom Services or prohibited from accessing and using the Development Services;&nbsp;</p>

          <p>You confirm that you are of legal age to form a binding contract with Loom; and</p>

          <p>You will comply with these terms and all applicable local, state, national and international laws, rules and regulations.&nbsp;</p>

          <p><strong>2. Privacy.</strong>&nbsp;</p>

          <p>Your privacy is important to Loom. Our goal is to make the Loom Services as good, useful and rewarding for you as possible. In order to do that, Loom may collect and process information from you when you use any of the Loom Services, post or bid on any Development Services or perform or receive any Development Services. Loom will collect certain personally identifiable information from you as set forth in more detail in our Privacy Policy. By accessing and using any of the Development Services, engaging any Contractor, posting or bidding on any Development Services or performing and receiving any Development Services, you agree that Loom may collect, use and disclose, as set forth in the Privacy Policy, the information you provide during your access to or use of any of the Loom Services, and in some cases information that is provided by or through any of the Loom Services, the engagement of any Contractor, the posting of or bidding on any Development Services&nbsp; or the receipt or performance of any Development Services by other parties.</p>

          <p><strong>3. License Grant; Unauthorized Use.</strong></p>

          <p><strong>3.1 LICENSE GRANT</strong></p>

          <p>Subject to your compliance with all the terms and conditions set out in these Terms, Loom hereby grants to you a limited, non-exclusive, non-transferable, freely revocable license to access and use the Site and the other Loom Services and the Development Services to the extent and in accordance with these Terms.</p>

          <p><strong>3.2 PREVENTION OF UNAUTHORIZED USE</strong></p>

          <p>Loom reserves the right to exercise whatever lawful means it deems necessary to prevent unauthorized use of any of the Loom Services and the Development Services, including, but not limited to, technological barriers, IP mapping, and directly contacting your Internet Development Service Provider (ISP) regarding such unauthorized use.</p>

          <p><strong>4. Development Services; Fees.</strong></p>

          <p>Loom offers an independent platform through which Companies can post Development Services (the “<strong>Posted Development Services</strong>”) that they need and can connect and engage Contractors to perform such Posted Development Services.&nbsp; Company shall provide the details and specifications of the work in commercially reasonable detail in connection with the Posted Development Services (collectively, the “<strong>Proposed Services Details</strong>”), including the deliverables, the estimated time to complete the Posted Development Services (the “<strong>Estimated Development Time</strong>”), the milestones, the payment schedule, the specifications, the project completion date and such other information as a Company considers relevant &nbsp;</p>

          <p>All Services Details shall be provided by a Company in good faith based on reasonable commercial assumptions and practices. The Services Details will generally be included on the Site. In certain circumstances, however, a Company may consider some or all of the Services Detail to be confidential (the “<strong>Confidential Services Details</strong>”).&nbsp; In that case, a Contractor will only be able to view the Confidential Services Details by agreeing to Loom’s required terms of confidentiality.</p>

          <p>Contractors can then bid to perform the Posted Development Services, including the applicable fees that such Contractor requires in order to perform the Posted Development Services (the “<strong>Services Bid</strong>”).&nbsp; Such fees can be in the form of equity in the Company (e.g., 1%, 2%, stock options, etc. (“<strong>Equity</strong>”)) or cash (collectively, the “<strong>Services Fees</strong>”) or a combination of cash and Equity.&nbsp;</p>

          <p>To post Development Services and to engage a Contractor, a Company must set-up an account with Loom. To bid on and perform the Development Services, and to view any Confidential Services Details, a Contractor must set-up an account with Loom. A Contractor does not need to set-up an account to see any Services Details that are publicly available on the Site.</p>

          <p>A Company and a Contractor can negotiate the Services Fees and the following Proposed Services Details (the “<strong>Negotiable Terms</strong>”):</p>

          <p>the Scope of Services</p>

          <p>the specific Deliverables</p>

          <p>the milestones</p>

          <p>the completion date for the Posted Development Services</p>

          <p>the specifications for the Services and the Deliverables</p>

          <p>the Payment Schedule (in accordance with the options described below)</p>

          <p>If a Company accepts a Services Bid, or a Company and a Contractor otherwise reach agreement on the Services Fees and the Negotiable Terms and Contractor has accepted the other Services Details (collectively, the “<strong>Accepted Services Details</strong>”), then such Company and such Contractor shall enter into Loom’s standard development agreement (as modified from time to time, the “<strong>Development Agreement</strong>”) and hereby incorporated by reference into these Terms and effective as of the date accepted in writing by both parties (the “<strong>Effective Date</strong>”). The Services Fees and any agreed Negotiable Terms will be incorporated into the Development Agreement. Subject to the foregoing, the parties may not modify the Development Agreement without the prior written approval of Loom, which approval shall be in Loom’s sole discretion.&nbsp;</p>

          <p>A party may only terminate a Development Agreement upon a material breach of such Development Agreement by the other party which is not cured within fifteen (15) days after written notice of such breach is provided by the non-breaching party. Company may also terminate a Development Agreement immediately upon written notice (i)&nbsp;upon a breach by Contractor of any terms of confidentiality under Section&nbsp;6.1 of the Development Agreement; or (ii)&nbsp;if Contractor engages in gross negligence, willful misconduct or fraud. To the extent that there is a conflict between the provisions of these Terms and the provisions of the Development Agreement, the provisions of these Terms will control.&nbsp;</p>

          <p>&nbsp;Any Services Fees shall either be (A) paid and/or granted and vest fifty percent (50%) upon execution of this Agreement and fifty percent (50%) within thirty&nbsp;(30) days following completion and acceptance of the Posted Development Services in accordance with these Terms and the terms of the Development Agreement (“<strong><em>Acceptance</em></strong>”) or (b) paid and/or granted and vest fifty percent (50%) upon completion of the Half-way Milestone (as defined below) as determined in the reasonable judgment of Company and fifty percent (50%) upon Acceptance. If the Services Fees are in the form of Equity, Company shall take all action necessary to have the Equity granted and issued in accordance with its stockplan and all applicable securities and other laws. If payment is based on the “Half-way Milestone”, then the milestones provided as part of the Proposed Services Details shall, at a minimum, include the milestone(s) that represent or otherwise reflect the half-way point for completion of the Posted Development Services (the “<strong>Half-way Milestone</strong>”). &nbsp;</p>

          <p>Concurrent with execution of the Development Agreement, Company shall pay a fee to Loom for providing the Loom Services based on an hourly rate set by Loom in its sole discretion (as modified from time to time, the “<strong>Hourly Rate</strong>”) multiplied by the Estimated Development Time (the “<strong>Estimated Loom Fee</strong>”). If the actual time to complete the Posted Development Services (the “<strong>Actual Development Time</strong>”) is greater than the Estimated Development Time, then the Estimated Loom Fee shall be trued-up to reflect the Actual Development Time and Company shall pay to Loom no later than ten (10) days after completion of the Posted Development Services the difference between (a) the Estimated Loom Fee and (b) the amount resulting from multiplying the Hourly Rate by the Actual Development Time (such difference, the “<strong>True-up Payment</strong>”). Loom reserves the right to modify any such Hourly Rate upon thirty (30) days’ prior written notice posted in advance on the Site. Any such increase shall apply in connection with any Development Services posted after such thirty (30) period.&nbsp; The current Hourly Rate can be found at joinloom.com/how-it-works. The Estimated Loom Fees and any True-up Payment shall be paid through a third party payment processor (e.g., Stripe, etc.) (any such third party payment processor, the “<strong>Third Party Processor</strong>”) or such other payment processor as directed by Loom. If Company fails to pay the applicable Estimated Loom Fee for any reason, then the Development Agreement shall automatically be terminated and Company agrees that it will not engage Contractor in connection with development or other services, and Contractor agrees that it will not perform any development or other services to Company, for a period of two (2) years from the termination date of the Development Agreement.</p>

          <p>Contractor shall provide the Development Services to Company on a non-exclusive basis and shall be free to bid on other Posted Development Services and provide its services to third parties during the term of any Development Agreement; provided however that the Contractor shall not provide such services to third parties in such a way that is inconsistent with any provisions hereof or the Development Agreement, or that so occupy the Contractor’s time and efforts as to impair or diminish the quality, professionalism or first priority performance of the Development Services provided to Company under the Development Agreement.&nbsp;</p>

          <p>Company and Contractor shall be solely responsible for resolving any dispute regarding the Development Agreement or any Posted Development Services, including the performance of the Posted Development Services, the Services Fees or the Services Details, and Loom shall have no responsibility or liability regarding any such dispute.&nbsp;</p>

          <p>To the extent that any sales or other similar taxes are payable by Loom, or any Third Party Processor in connection with the Posted Development Services or the Development Agreement, Company shall be obligated to pay to Loom, or any such Third Party Processor the amount of such taxes in addition to any other amounts owing to Loom.&nbsp; &nbsp;</p>

          <p>In paying the Estimated Loom Fees and any True-up Payment, Company acknowledges and agrees that it is not relying on future availability of any Development Services.&nbsp;</p>

          <p>ALL FEES, INCLUDING ANY ESTIMATED LOOM FEES, TRUE-UP PAYMENTS AND SERVICES FEES, ARE NON-REFUNDABLE, NON-CANCELLABLE AND NON-CREDITABLE UNLESS REQUIRED BY LAW.&nbsp;</p>

          <p><strong>5. Companies, Contractors and Support.</strong>&nbsp;</p>

          <p>(a) If you are a Company, you agree (i) that your engagement of any Contractor under these Terms and any Development Agreement is solely at your risk and Loom shall bear no responsibility or liability to you related to any such Contractor or the Posted Development Services, (ii) to comply with the terms and conditions of the Development Agreement, (iii) to take all actions necessary to pay, and to pay, the Services Fees (including getting all approvals from the Board of Directors (or its equivalent) if the Service Fee is in the form of Equity), (iv) to pay the Estimated Loom Fees and any True-up Payment in accordance with these Terms, (v) that Contractor and other Users can post evaluations regarding you and your performance under the Development Agreement (the “<strong>Company Evaluations</strong>”) and such Company Evaluations may be posted publicly on the Site without restriction and Loom shall have no responsibility or liability with respect to any such Evaluations and (vi) that Loom and other Users and third parties can acquire and post publicly on the Site background and other information about you (“<strong>Company Information</strong>”) without restriction, including content and other information from your LinkedIn account and your other social media accounts and Loom shall have no responsibility or liability with respect to any such Company Information. You also represent and warrant that (i) acceptance and performance of these Terms (A) do not breach any agreement of Company with any third party, or any duty arising in law or equity, (B) do not violate any applicable law, rule or regulation and (C) are within your powers, (ii) there are no legal actions pending or threatened against you that could interfere with the performance of your obligations under these Terms, and you shall promptly inform Loom of any such events that occur prior to the termination of these Terms and (iii) the payment of any Services Fees (including getting all approvals from the Board of Directors or otherwise if the Service Fee is in the form of Equity does not violate any applicable law, rule or regulation.&nbsp;</p>

          <p>(b) If you are a Contractor, you agree (i) that your engagement by any Company under these Terms and any Development Agreement is solely at your risk and Loom shall bear no responsibility or liability to you related to any such Company or the Posted Development Services (including the payment of any Services Fees), (ii) to comply with the terms and conditions of the Development Agreement, (iii) to perform the Posted Development Services in accordance with the Accepted Services Details and good industry standards, (iv) that Company and other Users can post evaluations regarding you and your performance of the Posted Development Services (the “<strong>Contractor Evaluations</strong>”) and such Contractor Evaluations may be posted publicly on the Site without restriction and Loom shall have no responsibility or liability with respect to any such Evaluations and (v) that Loom can acquire and post publicly on the Site background and other information about you (“<strong>Contractor Information</strong>”) without restriction, including content and other information from your LinkedIn account and your other social media accounts and Loom shall have no responsibility or liability with respect to any such Contractor Information. You also represent and warrant that (i) acceptance and performance of these Terms (A) do not breach any agreement of Contractor with any third party, or any duty arising in law or equity, (B) do not violate any applicable law, rule or regulation and (C) are within your powers, (ii) there are no legal actions pending or threatened against you that could interfere with the performance of the Posted Development Services and the delivery of any related deliverables, and you shall promptly inform Loom and Company of any such events that occur prior to the termination of these Terms; (iii) that you (A) are in the business of providing similar services to meet the requirements of your clients and (B) have substantial expertise in the performance of the Posted Development Services and the delivery of any related deliverables and (iv) you are an individual contractor and not an employee or contractor for any company that provides development and other similar services to third parties.&nbsp;</p>

          <p>(c) Loom shall provide technical and other support with respect to the Site and the other Development Services by email at support@joinloom.com. Support hours are 9:00 am to 5:00 pm CST, Monday through Friday with the exception of company holidays.</p>

          <p><strong>6. Additional Policies.</strong></p>

          <p>When using any of the Loom Services, you will be subject to any additional posted policies, guidelines or rules applicable to the Site and the Development Services and features which may be posted from time to time (the “<strong>Policies</strong>”). All such Policies are hereby incorporated by reference into these Terms.</p>

          <p><strong>7. Respecting other People’s Rights.&nbsp;</strong></p>

          <p>Loom respects the rights of others and so should you. You therefore may not post or send Content that:</p>

          <p>violates or infringes someone else’s rights of publicity, privacy, copyright, trademark, or other intellectual property right;</p>

          <p>is unlawful, threatening, abusive, harassing, defamatory, libelous, deceptive, fraudulent, invasive of another's privacy, tortious, obscene, vulgar, pornographic, offensive, profane, contains or depicts nudity, contains or depicts sexual activity, or is otherwise inappropriate as determined by Loom in its sole discretion;</p>

          <p>is false, misleading, untruthful or inaccurate;</p>

          <p>includes anyone's identification documents or sensitive financial information</p>

          <p>impersonates any person or entity, including any of Loom’s employees or representatives; or</p>

          <p>spams or solicits any Users, including any Companies or Contractors.</p>

          <p><strong>8. Account Security.</strong></p>

          <p>When you access and use any of the Loom Services, or post or bid on any Development Services, or perform or receive any Development Services, or provide or purchase any applications, products, services, or information from Loom, you may be asked to provide a password. You are solely responsible for maintaining the confidentiality of your account and password and for restricting access to your computer and mobile devices, and you agree to accept responsibility for all activities that occur under your account or password. You agree that the information you provide to Loom on registration and at all other times will be true, accurate, current, and complete. You also agree that you will ensure that this information is kept accurate and up-to-date at all times.&nbsp;</p>

          <p>If you change or deactivate the email that you used to create a Loom account, you must update your account information within 72 hours to prevent us from sending to someone else messages intended for you.</p>

          <p>&nbsp;</p>

          <p>If at any time you have reason to believe that your account is no longer secure (e.g., in the event of a loss, theft or unauthorized disclosure or use of your account ID, password, or any payment information, if applicable), then you shall immediately notify Loom at support@joinloom.com. You may be liable for the losses incurred by Loom or others due to any unauthorized use of your account or any of the Loom Services.</p>

          <p><strong>9.&nbsp; Modification of these Terms.</strong></p>

          <p>Loom reserves the right, at its sole discretion, to change, modify, add, or remove portions of these Terms at any time by posting the amended Terms to the Site or otherwise through the Loom Services.&nbsp; If Loom updates these Terms, it will update the “last updated” date at the top of the Terms.&nbsp; Please check these Terms, including any Policies, periodically for changes. Your continued use of the Development Services after the posting of changes constitutes your binding acceptance of such changes. In the event that a change to these Terms materially modifies your rights or obligations (including applicable fees), Loom will make reasonable efforts to notify you of such change. Loom may provide notice through a pop-up or banner within any of the Loom Services, by sending an email to any address you may have used to register for an account, or through other similar mechanisms. Additionally, if the changed Terms materially modify your rights or obligations, Loom may require you to provide consent by accepting the changed Terms. If Loom requires your acceptance of the changed Terms, changes are effective only after your acceptance. For all other changes, except as stated elsewhere by Loom, such amended Terms or fees will automatically be effective, replacing the previously-effective Terms or fees, thirty (30) days after they are initially posted on any of the Loom Services.&nbsp; <strong>IF AT ANY TIME YOU DO NOT AGREE TO THESE TERMS, PLEASE IMMEDIATELY TERMINATE YOUR USE OF ALL LOOM SERVICES AND DEVELOPMENT SERICES.</strong></p>

          <p>To the extent that any modifications to the Terms or Policies are not allowed under applicable laws, the prior most recent version of the Terms or Policies shall continue to apply.</p>

          <p><strong>10. Digital Millennium Copyright Act</strong>.</p>

          <p>It is Loom’s policy to respond to notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act. If you file a notice with our copyright agent, it must comply with the requirements set forth at <a href="https://www.law.cornell.edu/uscode/text/17/512">17 U.S.C. § 512(c)(3)</a>. Loom reserves the right to terminate without notice any User’s access to the Site, the other Loom Services and the Development Services if that User is determined by Loom to be a “repeat infringer.” In addition, Loom accommodates and does not interfere with standard technical measures used by copyright owners to protect their materials.&nbsp;</p>

          <p><strong>11. License Grant for Content; Representations and Warranties.</strong></p>

          <p><strong>11.1 LIMITED LICENSE GRANT TO Loom.</strong></p>

          <p>The Loom Services may now or in the future permit the submission and/or posting or linking of pictures, audio and video recordings, text, data, information and other input or any other content linked, posted, and/or submitted by you or other Users, in each case whether or not made available to other Users (“<strong>Content</strong>”). By uploading, providing, posting, distributing or disseminating any Content to or through any of the Loom Services, the posting of or bidding on any Development Services or the performance or receipt of any Development Services, you hereby grant to Loom a worldwide, non-exclusive, perpetual, irrevocable, transferable, sublicensable (through multiple tiers), assignable, fully paid-up, royalty-free, license to host, transfer, display, perform, reproduce, distribute, modify and otherwise exploit your Content (and any copyrights, publicity, database and other proprietary rights therein), in connection with the operation, maintenance and support of the Site and the other Loom Services and the Development Services.&nbsp;</p>

          <p><strong>11.2 content USE BY OTHER USERS.</strong></p>

          <p>You hereby consent to the use of your Content by other Users that are authorized to access your Content in the manner contemplated by these Terms and any of the Loom Services.</p>

          <p><strong>11.3 CONTENT AND CONFIDENTIAL INFORMATION.</strong></p>

          <p>You are solely responsible for the accuracy, quality, integrity, legality, reliability, and appropriateness of all of your Content and the consequences of posting or publishing any Content. By uploading and publishing your Content, you affirm, represent, and warrant that: (1) you are the creator and owner of or have the necessary licenses, rights, consents, and permissions to use and to authorize Loom and the Users to use and distribute your Content as necessary to exercise the licenses granted by you in this Section 11 and in the manner contemplated by Loom and these Terms; (2) your Content does not and will not: (a) infringe, violate, or misappropriate any third-party right, including any copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right or (b) slander, defame, libel, or violate or invade the right of privacy, publicity or other rights of any person or entity; and (3) your Content does not contain any viruses, adware, spyware, worms, or other malicious code or any content or file that provides a method to access to potentially infringing content outside of any of the Loom Development Services. Violators of these third-party rights may be subject to criminal and civil liability. Loom reserves all rights and remedies against any Users who violate these Terms.</p>

          <p><strong>11.4 CONTENT DISCLAIMER.</strong></p>

          <p>You understand that when using any of the Loom Services, posting of or bidding on any Development Services or performing or receiving any Development Services, you may be exposed to Content or other materials from a variety of sources, and that Loom is not responsible for the accuracy, usefulness, or intellectual property rights of or relating to such Content and other content. You further understand and acknowledge that you may be exposed to Content and other materials that are inaccurate, offensive, indecent, or objectionable, and you agree to waive, and hereby do waive, any legal or equitable rights or remedies you have or may have against Loom with respect thereto. Loom does not endorse any Content and other material or any opinion, recommendation or advice expressed therein, and Loom expressly disclaims any and all liability in connection with Content and other materials. If notified by a User or a content owner of any Content or other content or materials that allegedly do not conform to these Terms, Loom may investigate the allegation and determine in its sole discretion whether to remove the Content or other content or materials, which it reserves the right to do at any time and without notice. For clarity, Loom does not permit copyright infringing activities on or through any of the Loom Services.</p>

          <p><strong>12. Prohibited Conduct.</strong></p>

          <p>BY USING ANY OF THE LOOM SERVICES YOU AGREE NOT TO:</p>

          <p><strong>12.1</strong> Decipher, decompile, disassemble, reverse engineer, modify, translate, reverse engineer or otherwise attempt to derive source code, algorithms, tags, specifications, architectures, structures or other elements of any of the Loom Services, in whole or in part (except to the extent that the laws of your jurisdiction make such restrictions unenforceable);</p>

          <p><strong>12.2</strong> Use any of the Loom Services for the benefit of anyone other your Organization or you, including selling, reselling, distributing, hosting, leasing, renting, licensing or sublicensing, in whole or in part, any of the Loom Services, or any of the Development Services for hosting or time sharing services, or as part of a service bureau or outsourcing offering;</p>

          <p><strong>12.3</strong> Provide any services to any third party using any of the Loom Services except in accordance with these Terms;</p>

          <p><strong>12.4</strong> Prepare any derivative work of any of the Loom Services or the, or any other program based upon any of the Loom Services;</p>

          <p><strong>12.5</strong> Reproduce (except as expressly permitted herein), modify, adapt, translate or otherwise make any changes to any of the Loom Services or any part thereof;</p>

          <p><strong>12.6</strong> Copy, disclose, or distribute any data available on or through any of the Loom Services or Development Services, in any medium, including without limitation, by any automated or non-automated “scraping;”</p>

          <p><strong>12.7</strong> Interfere with, circumvent or disable any security or other technological features or measures of any of the Loom Services or attempt to gain unauthorized access to any of the Loom Services or its related systems or networks;</p>

          <p><strong>12.8</strong> Make unsolicited offers, advertisements, or proposals, or send junk mail or spam to other Users (including Companies and Contractors) of any of the Loom Services (including, but not limited to, unsolicited advertising, promotional materials or other solicitation material, bulk mailing of commercial advertising, chain mail, informational announcements, charity requests, and petitions for signatures);</p>

          <p><strong>12.9</strong> Use bots or other automated methods to: access any of the Loom Services or Development Services, download profiles, contacts or any other information, send or redirect messages or perform any other activities through any of the Loom Services; or</p>

          <p><strong>12.10</strong> Use any of the Loom Services or the Development Services for any unlawful or inappropriate activities, such as gambling, obscenity, pornography, violence, transmission of deceptive messages, or harassment.</p>

          <p><strong>13. Third Party Sites. </strong>&nbsp;</p>

          <p>The Loom Services may include links or references to other web sites or services (“<strong>Third Party Sites</strong>”) solely as a convenience to Users. Loom does not endorse any such Third Party Sites or the information, materials, products, or services contained on or accessible through Third Party Sites. In addition, your correspondence or business dealings with, or participation in promotions of, advertisers found on or through any of the Loom Development Services are solely between you and such advertiser. Access and use of Third Party Sites, including the information, materials, products, and services on or available through Third Party Sites are solely at your own risk.</p>

          <p><strong>14.</strong> <strong>Mobile and Data Charges.</strong></p>

          <p>You are responsible for any mobile and data charges that you may incur for using any of the Loom Services, including text-messaging charges. If you’re unsure what those charges may be, you should ask your service provider before using the Loom Services or the Development Services.</p>

          <p><strong>15. Termination; Terms of Use Violations.</strong></p>

          <p><strong>15.1 Loom.</strong></p>

          <p>You agree that Loom, in its sole discretion, for any or no reason, and without penalty, may terminate your use of the Loom Services or any account (or any part thereof) you may have with Loom and remove and discard all or any part of your account, user profile, and any Content, at any time. Loom may also in its sole discretion and at any time discontinue providing access to the Development Services, or any part thereof, with or without notice. You agree that any termination of your access to the Loom Services or the Development Services or any account you may have or portion thereof may be effected without prior notice, and you agree that Loom will not be liable to you or any third party for any such termination. Loom reserves the right to fully cooperate with any law enforcement authorities or court order requesting or directing Loom to disclose the identity of anyone posting any e-mail messages, or publishing or otherwise making available any materials that are believed to violate these Terms.&nbsp; Any suspected fraudulent, abusive or illegal activity may be referred to appropriate law enforcement authorities. These remedies are in addition to any other remedies Loom may have at law or in equity. As discussed herein, Loom does not permit copyright infringing activities on the Site or any of the other Loom Services or the Development Services, and shall be permitted to terminate access to any of the Loom Services, and remove all Content or other content submitted by any Users who are found to be repeat infringers. <strong>BY ACCEPTING THESE TERMS, YOU WAIVE AND SHALL HOLD LOOM HARMLESS FROM ANY CLAIMS RESULTING FROM ANY ACTION TAKEN BY LOOM DURING OR AS A RESULT OF ITS INVESTIGATIONS AND/OR FROM ANY ACTIONS TAKEN AS A CONSEQUENCE OF INVESTIGATIONS BY EITHER Loom OR LAW ENFORCEMENT AUTHORITIES.</strong></p>

          <p><strong>15.2 YOU.</strong></p>

          <p>Your only remedy with respect to any dissatisfaction with (i) the Site or the other Loom Services or the Development Services, (ii) any term of these Terms, (iii) any policy or practice of Loom in operating the Loom Services, or (iv) any Content transmitted through any of these Loom Services or the Development Services, is to terminate your account and your use of all of the Loom Services. You may terminate your use of the Loom Services and your account at any time. After such termination, you must refrain from use of the Loom Services until authorized by Loom.&nbsp;</p>

          <p><strong>16. Ownership; Proprietary Rights.&nbsp;</strong></p>

          <p>The Site and the other Loom Services are owned and operated by Loom.&nbsp; The visual interfaces, graphics, design, compilation, information, computer code (including source code or object code), products, software, services, and all other elements of the Loom Services provided by Loom (the “<strong>Materials</strong>”) are protected by United States copyright, trade dress, patent, and trademark laws, international conventions, and all other relevant intellectual property and proprietary rights, and applicable laws. Except for any Content that are provided and owned by Users, all Materials contained on any of the Loom Services are the property of Loom or its subsidiaries or affiliated companies and/or third-party licensors. All trademarks, service marks, and trade names are proprietary to Loom or its affiliates and/or third-party licensors. Except as expressly authorized by Loom, you agree not to sell, license, distribute, copy, modify, publicly perform or display, transmit, publish, edit, adapt, create derivative works from, or otherwise make unauthorized use of the Materials. Loom reserves all rights not expressly granted in these Terms.</p>

          <p>Loom shall own and have the unrestricted right to use or act upon any suggestions, ideas, enhancement requests, feedback, recommendations or other information provided by you or any other party relating to any of the Loom Services or any of the Development Service.</p>

          <p><strong>17. Indemnification.</strong>&nbsp;</p>

          <p>You agree to indemnify, save, and hold Loom, its affiliated companies, contractors, employees, agents and its third-party suppliers, licensors, and partners harmless from any claims, losses, damages, liabilities, including legal fees and expenses, arising out of your use or misuse of the Site, any of the other Loom Services or any of the Content, any violation by you of these Terms, any breach of the representations, warranties, and covenants made by you herein or the posting of or bidding on any Development Services, performing or receiving any Development Services, paying any Services Fees (including any Equity), or acquiring or posting directly or indirectly any background or other information about you. Loom reserves the right, at your expense, to assume the exclusive defense and control of any matter for which you are required to indemnify Loom, and you agree to cooperate with Loom’s defense of these claims. Loom will use reasonable efforts to notify you of any such claim, action, or proceeding upon becoming aware of it. &nbsp;</p>

          <p><strong>18. No Warranties; Disclaimers.</strong></p>

          <p><strong>18.1 NO WARRANTIES.</strong></p>

          <p>TO THE FULLEST EXTENT PERMISSIBLE PURSUANT TO APPLICABLE LAW, LOOM AND ITS AFFILIATES, CONTRACTORS, DIRECTORS, OFFICERS, EMPLOYEES, AGENTS, THIRD-PARTY PARTNERS, LICENSORS AND SUPPLIERS (COLLECTIVELY, THE “<strong>LOOM PARTIES</strong>”) DISCLAIM ALL WARRANTIES, STATUTORY, EXPRESS OR IMPLIED WITH RESPECT TO THE SITE AND THE OTHER LOOM SERVICES, AND THE DEVELOPMENT SERVICES, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT OF PROPRIETARY RIGHTS AND WARRANTIES ARISING FROM A COURSE OF DEALING, USAGE OR TRADE PRACTICE. WITHOUT LIMITATION TO THE FOREGOING, LOOM PROVIDES NO WARRANTY OR UNDERTAKING, AND MAKES NO REPRESENTATION OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE, THAT THE LOOM SERVICES OR THE DEVELOPMENT SERVICES, WILL MEET YOUR REQUIREMENTS OR ACHIEVE ANY INTENDED RESULTS. NO ADVICE OR INFORMATION, WHETHER ORAL OR WRITTEN, OBTAINED BY YOU FROM THE LOOM PARTIES OR THROUGH THE SITE OR THE OTHER LOOM SERVICES OR THE DEVELOPMENT SERVICES S WILL CREATE ANY WARRANTY NOT EXPRESSLY STATED HEREIN.</p>

          <p><strong>18.3 “AS IS” AND “AS AVAILABLE” AND “WITH ALL FAULTS”.</strong></p>

          <p>YOU EXPRESSLY AGREE THAT THE USE OF ANY OF THE LOOM SERVICESOR ANY DEVELOPMENT SERVICES, AND ANY DATA, ASSESSMENTS, RESULTS, INFORMATION, THIRD-PARTY SOFTWARE, CONTENT, THIRD PARTY SITES, SERVICES, OR APPLICATIONS MADE AVAILABLE IN CONJUNCTION WITH OR THROUGH ANY OF THE LOOM SERVICES OR DEVELOPMENT SERVICES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE”, “WITH ALL FAULTS” BASIS AND WITHOUT WARRANTIES OR REPRESENTATIONS OF ANY KIND EITHER EXPRESS OR IMPLIED.</p>

          <p><strong>18.4 PLATFORM OPERATION AND CONTENT.</strong></p>

          <p>THE LOOM PARTIES DO NOT WARRANT THAT THE DATA, ASSESSMENTS, RESULTS, CONTENT, FUNCTIONS, OR ANY OTHER INFORMATION OFFERED ON OR THROUGH ANY OF THE LOOM SERVICES OR DEVELOPMENT SERVICES, OR ANY THIRD PARTY SITES WILL BE UNINTERRUPTED, OR FREE OF ERRORS, VIRUSES OR OTHER HARMFUL COMPONENTS AND DO NOT WARRANT THAT ANY OF THE FOREGOING WILL BE CORRECTED.</p>

          <p><strong>18.4 ACCURACY.</strong></p>

          <p>EXCEPT AS SPECIFICALLY PROVIDED IN WRITING BY LOOM, THE LOOM PARTIES DO NOT WARRANT OR MAKE ANY REPRESENTATIONS REGARDING THE USE OR THE RESULTS OF THE USE OF ANY OF THE LOOM SERVICESTHE DEVELOPMENT SERVICES OR ANY THIRD PARTY SITES IN TERMS OF CORRECTNESS, ACCURACY, RELIABILITY, OR OTHERWISE.</p>

          <p><strong>18.5 HARM TO YOUR COMPUTER.</strong></p>

          <p>YOU UNDERSTAND AND AGREE THAT YOU USE, ACCESS, DOWNLOAD, OR OTHERWISE OBTAIN INFORMATION, MATERIALS, ASSESSMENTS, RESULTS OR DATA THROUGH ANY OF THE LOOM SERVICES, THE DEVELOPMENT SERVICES OR ANY THIRD PARTY SITES, AT YOUR OWN DISCRETION AND RISK AND THAT YOU WILL BE SOLELY RESPONSIBLE FOR ANY DAMAGE TO YOUR PROPERTY (INCLUDING YOUR COMPUTER SYSTEM) OR LOSS OF DATA THAT RESULTS FROM THE DOWNLOAD OR USE OF SUCH MATERIAL OR DATA.</p>

          <p><strong>18.6 SECURITIES</strong>.</p>

          <p>Loom is not a venture fund, investment bank, broker dealer, investment clearing-house, investment club, or investment advisor, but rather a platform through which Companies can connect and engage Contractors for Development Services at the Services Fees as agreed solely between a Company and a Contractor.&nbsp; Loom is not registered with the Securities Exchange Commission, any self-regulatory organization or any state securities commission.&nbsp; Loom does not recommend or make any representation or warranty regarding any Services Fees. Company and Contractor shall be solely responsible for compliance with all securities and other laws and regulations relating to the issuance of any of the Services Fees comprised of Equity and each of the Parties shall indemnify Loom for all claims, losses, damages, liabilities, including legal fees and expenses, arising out of or related to any such Equity.</p>

          <p><strong>19. LIMITATION OF LIABILITY AND DAMAGES.</strong></p>

          <p><strong>19.1 LIMITATION OF LIABILITY.</strong></p>

          <p>UNDER NO CIRCUMSTANCES, INCLUDING, BUT NOT LIMITED TO, NEGLIGENCE, WILL THE LOOM PARTIES BE LIABLE FOR ANY SPECIAL, INDIRECT, INCIDENTAL, CONSEQUENTIAL, PUNITIVE, RELIANCE, OR EXEMPLARY DAMAGES (INCLUDING WITHOUT LIMITATION DAMAGES ARISING FROM ANY UNSUCCESSFUL COURT ACTION OR LEGAL DISPUTE, LOST BUSINESS, LOST REVENUES OR LOSS OF ANTICIPATED PROFITS OR ANY OTHER PECUNIARY OR NON-PECUNIARY LOSS OR DAMAGE OF ANY NATURE WHATSOEVER) ARISING OUT OF OR RELATING TO THESE TERMS OR THAT RESULT FROM YOUR USE OR YOUR INABILITY TO USE THE MATERIALS, ASSESSMENTS, RESULTS OR CONTENT ON THE SITE OR THE OTHER LOOM SERVICES, OR THE DEVELOPMENT SERVICES OR ANY OTHER INTERACTIONS WITH LOOM, A COMPANY OR A CONTRACTOR, EVEN IF LOOM OR A LOOM AUTHORIZED REPRESENTATIVE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. APPLICABLE LAW MAY NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY OR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE LIMITATION OR EXCLUSION MAY NOT APPLY TO YOU. IN SUCH CASES, LOOM’S LIABILITY WILL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW.</p>

          <p><strong>19.2 LIMITATION OF DAMAGES.</strong></p>

          <p>IN NO EVENT WILL THE LOOM PARTIES’ TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE SITE AND THE OTHER LOOM SERVICES OR THE DEVELOPMENT SERVICES, OR YOUR INTERACTION WITH OTHER USERS (WHETHER IN CONTRACT, TORT INCLUDING NEGLIGENCE, WARRANTY, OR OTHERWISE), EXCEED THE AMOUNT PAID BY YOU, IF ANY, TO LOOM DURING THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE DATE OF THE CLAIM OR TEN DOLLARS, WHICHEVER IS GREATER.</p>

          <p><strong>19.3 RELEASE FOR DISPUTES BETWEEN USERS.</strong></p>

          <p>If you have a dispute with any other Users (including any Company or Contractor) or other third parties, you release Loom and the other Loom Parties from claims, demands and damages (actual and consequential) of every kind and nature, known and unknown, arising out of or in any way connected with such disputes. If you are a California resident, you waive California Civil Code Section 1542, which says: “A general release does not extend to claims which the creditor does not know or suspect to exist in his favor at the time of executing the release, which if known by him must have materially affected his settlement with the debtor.”</p>

          <p><strong>19.4 THIRD PARTY SITES.</strong></p>

          <p>THESE LIMITATIONS OF LIABILITY ALSO APPLY WITH RESPECT TO DAMAGES INCURRED BY YOU BY REASON OF ANY PRODUCTS OR SERVICES SOLD OR PROVIDED ON ANY THIRD PARTY SITES OR OTHERWISE BY THIRD PARTIES OTHER THAN LOOM AND RECEIVED THROUGH OR ADVERTISED ON ANY OF THE LOOM SERVICES OR RECEIVED THROUGH ANY THIRD PARTY SITES.</p>

          <p><strong>19.5 BASIS OF THE BARGAIN.</strong></p>

          <p>YOU ACKNOWLEDGE AND AGREE THAT LOOM HAS OFFERED THE LOOM SERVICES AND THE DEVELOPMENT SERVICES, SET ITS PRICES, AND ENTERED INTO THESE TERMS IN RELIANCE UPON THE WARRANTY DISCLAIMERS AND THE LIMITATIONS OF LIABILITY SET FORTH HEREIN, THAT THE WARRANTY DISCLAIMERS AND THE LIMITATIONS OF LIABILITY SET FORTH HEREIN REFLECT A REASONABLE AND FAIR ALLOCATION OF RISK BETWEEN YOU AND LOOM, AND THAT THE WARRANTY DISCLAIMERS AND THE LIMITATIONS OF LIABILITY SET FORTH HEREIN FORM AN ESSENTIAL BASIS OF THE BARGAIN BETWEEN YOU AND LOOM. LOOM WOULD NOT BE ABLE TO PROVIDE ANY OF THE LOOM SERVICES OR THE DEVELOPMENT SERVICES TO YOU ON AN ECONOMICALLY REASONABLE BASIS WITHOUT THESE LIMITATIONS.</p>

          <p><strong>19.6 LIMITATIONS BY APPLICABLE LAW.</strong></p>

          <p>CERTAIN JURISDICTIONS DO NOT ALLOW LIMITATIONS ON IMPLIED WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF YOU RESIDE IN SUCH A JURISDICTION, SOME OR ALL OF THE ABOVE DISCLAIMERS, EXCLUSIONS, OR LIMITATIONS MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS. THE LIMITATIONS OR EXCLUSIONS OF WARRANTIES, REMEDIES OR LIABILITY CONTAINED IN THESE TERMS APPLY TO YOU TO THE FULLEST EXTENT SUCH LIMITATIONS OR EXCLUSIONS ARE PERMITTED UNDER THE LAWS OF THE JURISDICTION WHERE YOU ARE LOCATED.</p>

          <p><strong>20. United States Export Controls.</strong></p>

          <p><strong>&nbsp; </strong>You agree not to import, export, re-export, or transfer, directly or indirectly, any part of the Loom Services or any underlying intellectual property, information or technology except in full compliance with all United States, foreign and other applicable export control laws and regulations.</p>

          <p><strong>21. Miscellaneous</strong>.</p>

          <p><strong>21.1 NOTICE.</strong></p>

          <p>Loom may provide you with notices, including those regarding changes to these Terms, by email, regular mail or postings on any of the Loom Services. Notice will be deemed given twenty-four hours after the email is sent, unless Loom is notified that the email address is invalid. Alternatively, Loom may give you legal notice by mail to a postal address, if provided by you through any of the Loom Services. In such case, notice will be deemed given three days after the date of mailing. Notice posted on any of the Loom Services is deemed given 30 days following the initial posting.</p>

          <p><strong>21.2 WAIVER.</strong></p>

          <p>The failure of Loom to exercise or enforce any right or provision of these Terms will not constitute a waiver of such right or provision. Any waiver of any provision of these Terms will be effective only if in writing and signed by Loom.</p>

          <p><strong>21.3 DISPUTE RESOLUTION.</strong></p>

          <p>If a dispute arises between you and Loom, the goal is to provide you with a neutral and cost effective methods of resolving the dispute quickly. Accordingly, you and Loom agree that any dispute, claim or controversy at law or equity that arises out of these Terms, the Site or any of the other Loom Services, or the Development Services (a “<strong>Claim</strong>”) will be resolved in accordance with this Section or as Loom and you otherwise agree in writing. Before resorting to these dispute methods, Loom strongly encourages you to first contact Loom directly to seek a resolution.&nbsp;</p>

          <p><strong>(a) Choice of Law.</strong>&nbsp;THESE TERMS SHALL BE GOVERNED IN ALL RESPECTS BY THE LAWS OF THE STATE OF TEXAS, WITHOUT REGARD TO ITS CONFLICT OF LAW PROVISIONS. EACH PARTY IRREVOCABLY AND UNCONDITIONALLY WAIVES, TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, ANY RIGHT IT MAY HAVE TO A TRIAL BY JURY IN ANY LEGAL ACTION, PROCEEDING, CAUSE OF ACTION OR COUNTERCLAIM ARISING OUT OF OR RELATING TO ANY CLAIM OR OTHERWISE IN CONNECTION WITH THESE TERMS, ANY OF THE LOOM SERVICES OR THE DEVELOPMENT SERVICES.</p>

          <p><strong>(b) Arbitration and Class Action Waiver</strong>.<strong>&nbsp;</strong></p>

          <p><strong>PLEASE REVIEW AS THIS AFFECTS YOUR LEGAL RIGHTS</strong><strong>.</strong></p>

          <p>(i) Arbitration. YOU AGREE THAT ALL CLAIMS BETWEEN YOU AND LOOM (WHETHER OR NOT SUCH CLAIM INVOLVES A THIRD PARTY) IN CONNECTION WITH THESE TERMS, ANY OF THE LOOM SERVICES OR DEVELOPMENT SERVICES, INCLUDING WITHOUT LIMITATION, YOUR RIGHTS OF PRIVACY, WILL BE RESOLVED BY BINDING, INDIVIDUAL ARBITRATION UNDER THE AMERICAN ARBITRATION ASSOCIATION'S RULES FOR ARBITRATION OF CONSUMER-RELATED DISPUTES AND YOU AND LOOM HEREBY EXPRESSLY WAIVE TRIAL BY JURY. DISCOVERY AND RIGHTS TO APPEAL IN ARBITRATION ARE GENERALLY MORE LIMITED THAN IN A LAWSUIT, AND OTHER RIGHTS THAT YOU AND LOOMWOULD HAVE IN COURT MAY NOT BE AVAILABLE IN ARBITRATION. You may bring claims only on your own behalf.&nbsp;</p>

          <p>Neither you nor Loom will participate in a class action or class-wide arbitration for any claims covered by this agreement to arbitrate. YOU ARE GIVING UP YOUR RIGHT TO PARTICIPATE AS A CLASS REPRESENTATIVE OR CLASS MEMBER ON ANY CLASS CLAIM YOU MAY HAVE AGAINST LOOM INCLUDING ANY RIGHT TO CLASS ARBITRATION OR ANY CONSOLIDATION OF INDIVIDUAL ARBITRATIONS. You also agree not to participate in claims brought in a private attorney general or representative capacity, or consolidated claims involving another person's account, if Loom is a party to the proceeding.&nbsp;</p>

          <p>This dispute resolution provision will be governed by the Federal Arbitration Act and not by any state law concerning arbitration. In the event the American Arbitration Association is unwilling or unable to set a hearing date within one hundred and sixty (160) days of filing the case, then either Loom or you can elect to have the arbitration administered instead by the Judicial Arbitration and Mediation Services. Judgment on the award rendered by the arbitrator may be entered in any court having competent jurisdiction. Any provision of applicable law notwithstanding, the arbitrator will not have authority to award damages, remedies or awards that conflict with these Terms.</p>

          <p>(ii) Judicial Forum for Disputes. In the event that the agreement to arbitrate under Section 21.3(b) is found not to apply to you or your claim, you and Loom agree that any judicial proceeding (other than small claims actions) must be brought solely and exclusively in, and will be subject to the service of process and other applicable procedural rules of, the federal or state courts of Travis County, TX. Both you and Loom irrevocably consent to venue and personal jurisdiction there. Notwithstanding the foregoing, Loom may bring a claim for equitable relief in any court with proper jurisdiction. &nbsp;</p>

          <p>(iii) This arbitration agreement will survive the termination of your use of any of the Loom Development Services or your relationship with Loom.</p>

          <p><strong>(c) Improperly Filed Claims.</strong>&nbsp;All claims you bring against Loom must be resolved in accordance with this Section 21.3. All claims filed or brought contrary to this Section 21.3 shall be considered improperly filed. Should you file a claim contrary to this Section 21.3, Loom may recover attorneys’ fees and costs up to $15,000, provided that Loom has notified you in writing of the improperly filed claim, and you have failed to promptly withdraw the claim.</p>

          <p>(d) <strong>Prevailing Party</strong>.&nbsp; In the event that either party institutes any legal suit, action or proceeding against the other party arising out of or relating to these Terms, the Privacy Policy, or any of the Loom Services, and the Development Services, the prevailing party in the suit, action or proceeding shall be entitled to receive in addition to all other damages to which it may be entitled, the costs incurred by such party in conducting the suit, action or proceeding, including reasonable attorneys' fees and expenses and court costs.</p>

          <p>(E)<strong>&nbsp; LIMITATION ON TIME TO FILE CLAIMS. </strong>ANY CAUSE OF ACTION OR CLAIM YOU MAY HAVE ARISING OUT OF OR RELATING TO THESE TERMS, THE PRIVACY POLICY, ANY OF THE LOOM SERVICES, THE DEVELOPMENT SERVICES, ANY PRODUCT OR OTHER SERVICES, ANY CONTENT OR YOUR RELATIONSHIP WITH US MUST BE COMMENCED WITHIN ONE (1) YEAR AFTER THE CAUSE OF ACTION ACCRUES, OTHERWISE, SUCH CAUSE OF ACTION OR CLAIM IS PERMANENTLY BARRED.</p>

          <p><strong>21.4 SEVERABILITY.</strong></p>

          <p>If any provision of these Terms (including any Policies) is held to be unlawful, void, or for any reason unenforceable, then that provision will be limited or eliminated from these Terms to the minimum extent necessary and will not affect the validity and enforceability of any remaining provisions.</p>

          <p><strong>21.5 ASSIGNMENT.</strong></p>

          <p>These Terms and related Policies, and any rights and licenses granted hereunder, may not be transferred or assigned by you, but may be assigned by Loom without restriction. Any assignment attempted to be made in violation of these Terms shall be void.</p>

          <p><strong>21.6 SURVIVAL.</strong></p>

          <p>Upon termination of these Terms, your use of the Site any of the other Loom Services or the Development Services or your relationship with Loom, any provision which, by its nature or express terms should survive, will survive such termination or expiration, including, but not limited to, Sections 1, 2, and 8 -21.</p>

          <p><strong>21.7 HEADINGS.</strong></p>

          <p>The heading references herein are for convenience purposes only, do not constitute a part of these Terms, and will not be deemed to limit or affect any of the provisions hereof.</p>

          <p><strong>21.8 ENTIRE AGREEMENT.</strong></p>

          <p>These Terms, including the Privacy Policy and the Policies are the entire agreement between you and Loom relating to the subject matter herein and will not be modified except by a change to these Terms or Policies made by Loom as set forth in Section 8 above or as provided in the applicable agreement.</p>

          <p><strong>21.9 NO AGENCY.</strong></p>

          <p>No agency, partnership, joint venture, employee-employer or franchiser-franchisee relationship is intended or created by these Terms.&nbsp;</p>

          <p><strong>21.10 geographich restrictions</strong></p>

          <p>Loom is based in the state of Texas in the United States. Loom makes no claims that any of the Loom Services or Development Services or any of the content is accessible or appropriate outside of the United States. Access to the Site and the other Loom Services, and the Development Services may not be legal by certain persons or in certain countries. If you access any of these Loom Services or any of the Development Services from outside the United States, you do so on your own initiative and are responsible for compliance with local laws and you agree to waive, and hereby do waive, any legal or equitable rights or remedies you have or may have against Loom with respect thereto.</p>

          <p><strong>22.11 DISCLOSURES.</strong></p>

          <p>The Site and the other Loom Services, and the Development Services are offered by Loom located at: 501 Pedernales 1B, Austin, Texas 78702 and email: support@joinloom.com. The Development Services are provided directly by the applicable Contractor. If you are a California resident, you may have this same information emailed to you by sending a letter to the foregoing address with your email address and a request for this information.&nbsp;</p>

          <p><em>© 2016 Loom Labs, Inc.</em></p>
          </div>
      )
    }
  });

  const Privacy = React.createClass({
    render() {
      return (
            <div>
              <h2>Privacy Policy</h2>
              <p><strong>Loom Labs</strong></p>

              <p><strong>Privacy Policy</strong></p>

              <p>Last Updated: August 8, 2016</p>

              <p>Loom Labs, Inc. <strong>"Loom"</strong> <strong>"we" </strong>“<strong>our</strong>” or “<strong>us</strong>” respects your privacy and is committed to protecting it through our compliance with this privacy policy. We provide an independent platform through which companies (“<strong>Companies</strong>”) can connect and engage independent contractors (“<strong>Contractors</strong>”) for web development and other services (the “<strong>Development Services</strong>”).</p>

              <p>Please note that by visiting or using http://joinloom.com (the “<strong>Site)</strong> and the various other related services, features, functions, software, applications, websites and networks (together with the Site and the Development Services, collectively, the “<strong>Loom Services</strong>”) provided by Loom, you are accepting the practices described in this privacy policy. This privacy policy is also incorporated by reference into Terms of Service and the various other agreements and terms and conditions that govern your use of the Site, the Development Services and the other Loom Services (collectively, the “<strong>Terms</strong>”).</p>

              <p>This policy describes the types of information we may collect from you or that you may provide when you access or use the Site, the Development Service, the Other Loom Services or other features, functions, services products and our practices for collecting, using, maintaining, protecting and disclosing that information.&nbsp;</p>

              <p>This policy applies to information we collect or may collect:</p>

              <p>In accessing and using the Site.</p>

              <p>In registering to use or provide the Development Services and the other Loom Services.&nbsp;</p>

              <p>In accessing and using the Development Services and the other Loom Services.</p>

              <p>In e-mail, text and other electronic messages sent through or use of the Site, the Development Services and the other Loom Services.&nbsp;</p>

              <p>In accessing and using social media platforms such as LinkedIn.</p>

              <p>When you interact with Companies, Contractors and the other users of the Site, the Development Services and the other Loom Services.</p>

              <p>When you send any content through the Site, the Development Services or any of the other Loom Services.</p>

              <p>Through services provided to us by third-party companies, agents or contractors.&nbsp;</p>

              <p>It does not apply to information collected by:</p>

              <p>Us offline or through any other means, including on any other website operated by Loom or any third party; or&nbsp;</p>

              <p>Any third party, including through any application or content (including advertising) that may be accessible from or on the Site, the Development Services or any of the other Loom Services.</p>

              <p>Please read this policy carefully to understand our policies and practices regarding your information and how we will treat it. If you do not agree with our policies and practices, your only choice is not to use the Development Services or any of the other Loom Services. By accessing or using any of the Loom Services, you agree to this privacy policy. This policy may change from time to time. Your continued use of the Site, the Development Services and/or any of the other Loom Services, after we make changes is deemed to be acceptance of those changes, so please check the policy periodically for updates.&nbsp;</p>

              <p><strong>Minors under the Age of 18</strong></p>

              <p>None of the Loom Services are intended for minors under 18 years of age. No one under age 13 may provide any information on or through the Site, the Development Services or the other Loom Services. We do not knowingly collect personal information from children under 13. If you are under 13, do not use or provide any information on or through any of the Loom Services or any of its features or register on the Site use any of the interactive or public comment features of any of the Loom Services or provide any information about yourself to us, including your name, address, telephone number, e-mail address or any screen name or user name you may use. If we learn we have collected or received personal information from a child under 13 without verification of parental consent, we will delete that information. If you believe that we might have any information from or about a child under 13, please contact us at support@joinloom.com.&nbsp;</p>

              <p><strong>Information We Collect About You and How We Collect It</strong></p>

              <p>We collect or may collect several types of information from and about Companies, Contractors and other users of the Site, the Development Services and the other Loom Services, including:&nbsp;</p>

              <p>Information by which you may be personally identified, such as name, e-mail address, location, profile picture, job title, biography, recommendations and reviews (<strong>"personal information"</strong>);&nbsp;</p>

              <p>Financial and billing information;</p>

              <p>Analytics information;</p>

              <p>Information that is available on social media platforms such as LinkedIn;</p>

              <p>Information that is about you but individually does not identify you, such as IP address and date and time of visit;</p>

              <p>Information from your device, including contact information;</p>

              <p>Usage details and information, including how you communicate with other users of the Site, the Development Services and the other Loom Services, such as the time, date, sender and your interactions with messages (such as when you open a message or capture a screenshot);</p>

              <p>Information contained in the comments and postings on or through any of the Loom Services;</p>

              <p>Device, internet and mobile information such as the hardware model, operating system version, unique device identifiers, browser type, language, wireless network, and mobile network information (including the mobile phone number);</p>

              <p>Location information when you use the Site; &nbsp;</p>

              <p>Information that you provide by registering or filling in forms or applications on or through the Site. This includes information provided in connection with registering to access and use the Development Services and the other Loom Services; &nbsp;</p>

              <p>When you report a problem with the Site, the Development Services or any of the other Loom Services;</p>

              <p>Records and copies of your correspondence (including e-mail addresses), if you contact us;</p>

              <p>Details of transactions you carry out through the Site, the Development Services and any of the other Loom Services; and/or</p>

              <p>Your search queries on or through any of Loom Services.</p>

              <p>We collect this information:</p>

              <p>Directly from you when you provide it to us.</p>

              <p>Automatically as you navigate through or use the Site, the Development Services and the other Loom Services.</p>

              <p>From third parties, such as Companies, Contractors, other Users and our customers, business partners and other third parties that provide us or you with certain services.&nbsp;</p>

              <p>Certain web transactions may also involve you calling us or our calling you. Please be aware that we may monitor and in some cases record such calls for staff training or quality assurance purposes.</p>

              <p>You may now or in the future provide pictures, audio and video recordings, text, data, information and other input or any other content linked, posted, and/or submitted by you or other users to be published or displayed (hereinafter, <strong>"posted"</strong>) on or through the Site, or transmitted to third parties or other users of, the Development Services or any of the other Loom Services (collectively, <strong>"User Content"</strong>). Your User Content is posted on and transmitted to others at your own risk.&nbsp; We cannot control the actions of other users of the Site, the Development Services or the other Loom Services, with whom your User Content is shared. Therefore, we cannot and do not guarantee that your User Content will not be viewed, downloaded or shared by unauthorized persons.</p>

              <p><strong>Use of Cookies and Other Tracking Technologies.</strong></p>

              <p>The technologies we use for automatic data collection may include: <strong>[</strong></p>

              <p><strong>Cookies (or browser cookies).</strong> A cookie is a small file placed on the hard drive of your computer. You may refuse to accept browser cookies by activating the appropriate setting on your browser. However, if you select this setting you may be unable to access certain parts of the Site. Unless you have adjusted your browser setting so that it will refuse cookies, our system will issue cookies when you direct your browser to the Site.&nbsp;</p>

              <p><strong>Flash Cookies.</strong> Certain features of the Site may use local stored objects (or Flash cookies) to collect and store information about your preferences and navigation to, from and on the Site. Flash cookies are not managed by the same browser settings as are used for browser cookies.</p>

              <p><strong>Web Beacons.</strong> Pages of the Site and our e-mails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags and single-pixel gifs) that permit Loom, for example, to count users who have visited those pages or opened an e-mail and for other related website statistics (for example, recording the popularity of certain website content and verifying system and server integrity). &nbsp;</p>

              <p><strong>Do Not Track Policy</strong></p>

              <p>Your web browser may offer you a “Do Not Track” option, which allows you to signal to operators of websites and web applications and services (including behavioral advertising services) that you do not wish such operators to track certain of your online activities over time and across different websites. We do not honor any web browser “Do Not Track” signals or other mechanisms that provide you with the ability to exercise choice regarding the collection of personally identifiable information about your online activities over time and across third-party websites or online services.&nbsp;</p>

              <p><strong>Third-party Responsibilities and Services.&nbsp;</strong></p>

              <p>We may use or partner with other third party companies, agents or contractors for various purposes in connection with our business and operations (“<strong>Service Providers</strong>”), including, billing and payments, relationship building, the marketing and growth of our business and the performance of services on our behalf, such as gathering and analyzing information and the provision of services to you.&nbsp; In the course of performing these responsibilities and providing such services, these other companies may have access to your information.&nbsp; We may also share information, including your information, with these Services Providers in order to enable them to perform these responsibilities and to provide these services.&nbsp; Many Services Providers have adopted their own privacy policies, which are not subject to control by Loom. You should always review the policies of these Service Providers to make sure that you are comfortable with the ways in which they collect, use, maintain, protect and disclose your information.</p>

              <p>The Service Providers may also transmit cookies to your computer or device, when you click on ads that appear on or through the Service. Also, if you click on a link to a third party website, such third party may also transmit cookies to you. Please be aware that cookies placed by third parties may continue to track your activities online even after you are no longer using any our Services, and those third parties may not honor “Do Not Track” requests you have set using your web browser.</p>

              <p><strong>Use of Remarketing with Google Analytics and Google Adwords and other Remarking Services</strong></p>

              <p>The Site may use the Google AdWords and other remarketing service to advertise on third party websites (including Google) to previous visitors to the Site. It could mean that we advertise to previous visitors who haven’t completed a task on the Site, for example using the contact form to make an enquiry. This could be in the form of an advertisement on the Google search results page, or a site in the Google Display Network. Service Providers, including Google, use cookies to serve ads based on someone’s past visits to the Site. Of course, any data collected will be used in accordance with this privacy policy, Google’s privacy policy or the privacy policy of other remarketing services used by Loom.</p>

              <p>You can set preferences for how Google advertises to you using the <a href="http://www.google.com/settings/ads/onweb/">Google Ad Preferences page</a>, and if you want to, you can <a href="http://www.google.com/settings/ads/onweb/">opt out of interest-based advertising entirely by cookie&nbsp; settings</a> or <a href="https://www.google.com/settings/u/0/ads/plugin?hl=en">permanently using a browser plugin</a>.</p>

              <p><em>DoubleClick: We may use Google Analytics remarketing codes to log when users view specific pages or take specific actions on a website. This allows us to provide targeted advertising in the future. If you do not wish to receive this type of advertising from us in the future you can opt out using the </em><a href="https://www.google.com/settings/u/0/ads/plugin?hl=en"><em>DoubleClick opt-out page</em></a><em> or the </em><a href="http://www.networkadvertising.org/managing/opt_out.asp"><em>Network Advertising Initiative opt-out page</em></a><em>.</em></p>

              <p>Google has additional information available about its Remarketing Privacy Guidelines, <a href="http://adwords.google.com/support/aw/bin/answer.py?hl=en&amp;answer=143465">Policies</a>, and Restrictions on its website.</p>

              <p><strong>How We Use Your Information</strong></p>

              <p>We use information that we collect about you or that you provide to us, including any personal information: &nbsp;</p>

              <p>To provide you the Development Services and the other Loom Services and the content and the other products and services that you request from us.</p>

              <p>To provide the Site and its contents to you.&nbsp;</p>

              <p>To process and complete transactions and send you related information, including the request for and the provision of the Development Servicers.</p>

              <p>To provide technical and other support to you.</p>

              <p>To send you promotional communications, such as providing you with information about services, features, surveys, newsletters, offers and events; and providing other news or information about us, our customers and our select partners.&nbsp;</p>

              <p>To enable Service Providers to perform certain responsibilities and provide certain services in connection with our business and operations.</p>

              <p>To fulfill any other purpose for which you provide it.</p>

              <p>To provide you with notices about your account.</p>

              <p>To carry out our obligations and enforce our rights arising from any contracts entered into between you and us, including for billing and collection.</p>

              <p>To notify you about changes to the Site, the Development Services and the other Loom Services.&nbsp;</p>

              <p>To allow you to participate in interactive features on or through any of the Loom Services.&nbsp;</p>

              <p>To enhance the safety and security of all of the Loom Services.&nbsp;</p>

              <p>To verify your identity and prevent fraud or other unauthorized or illegal activity.</p>

              <p>To enable marketing, remarketing and targeted advertising and similar services from us or Service Providers, including direct and indirect marketing and on-line behavioral advertising regarding our own and third party products and services that we believe may be of interest to you, including advertisement on third party websites.</p>

              <p>To perform targeted and other advertising on third party websites.</p>

              <p>In any other way we may describe when you provide the information.</p>

              <p>For any other purpose with your consent.</p>

              <p>Some of the information that we collect automatically is statistical data and does not include personal information, but we may maintain it or associate it with personal information we collect in other ways or receive from third parties or you provide to us. It helps us to improve the Site, the Development Services and the other Loom Services, and to deliver a better and more personalized service, including enabling us to:</p>

              <p>Estimate our audience size and better understand usage patterns.</p>

              <p>Store information about your preferences, enabling us to customize the Site according to your individual interests.</p>

              <p>Speed up your searches.</p>

              <p>Recognize you when you return to the Site.</p>

              <p><strong>Storage and Transfer of Your Information</strong></p>

              <p>We may store any information that we collect (personal or otherwise) ourselves or in databases owned and maintained by us, our affiliates, agents or Service Providers. If you access or use the Site, the Development Services or any of the other Loom Services outside of the United States, information that we collect about you may be transferred to servers inside the United States and maintained indefinitely, which may involve the transfer of information out of countries located in the European Economic Area and other parts of the world unless otherwise prohibited by applicable law or agreed by Loom and you. By allowing Loom to collect information about you, you consent to such transfer and processing of such information without restriction. We may also store some information locally on your computer or other devices. For example, we may store information as local cache so that you can open the Site and view content faster.&nbsp;</p>

              <p>Although users from all over the world may access the Site, the Development Services and the other Loom Services, keep in mind that no matter where you live or where you happen to use our services, you consent to us processing and transferring information in and to the United States and other countries whose data-protection and privacy laws may offer fewer protections than those in your home country.&nbsp;</p>

              <p><strong>Disclosure of Your Information</strong></p>

              <p>We may disclose aggregated information about our users, and information that does not identify any individual, without restriction.&nbsp;</p>

              <p>We may disclose personal information that we collect or you provide as described in this privacy policy:&nbsp; <strong>&nbsp;</strong></p>

              <p>To our subsidiaries and affiliates.</p>

              <p>To other users in your organization in connection with any of the Development Services or any of the other Loom Services.</p>

              <p>To Companies in connection with the Development Services.</p>

              <p>To Contractors in connection with the Development Services.</p>

              <p>To Service Providers, contractors and other third parties we use to support our business, including credit card payment processors and marketing support.</p>

              <p>To a potential or actual buyer. assignee or other successor (including its related advisors and agents) in the event of a merger, divestiture, restructuring, reorganization, dissolution or other sale or transfer of some or all of Loom' assets, whether as a going concern or as part of bankruptcy, liquidation or similar proceeding, in which personal information held by Loom about Companies, Contractors and other users of the Site is among the assets that may be or are actually transferred.</p>

              <p>To fulfill the purpose for which you provide it. &nbsp;</p>

              <p>For any other purpose disclosed by us when you provide the information.</p>

              <p>With your consent.</p>

              <p>We may also disclose your personal information:</p>

              <p>To comply with any court order, law or legal process, including to respond to any government or regulatory request.</p>

              <p>To enforce or apply the Terms and other agreements, including for billing and collection purposes.&nbsp; <strong>&nbsp;</strong></p>

              <p>If we believe disclosure is necessary or appropriate to protect the rights, property, or safety of Loom, our customers or others. &nbsp;</p>

              <p><strong>Choices About How We Use and Disclose Your Information&nbsp;</strong></p>

              <p>We strive to provide you with choices regarding the personal information you provide to us. We have created mechanisms to provide you with the following control over your information:&nbsp;</p>

              <p><strong>Tracking Technologies and Advertising.</strong> You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent. To learn how you can manage your Flash cookie settings, visit the Flash player settings page on Adobe's <a href="http://www.macromedia.com/support/documentation/en/flashplayer/help/settings_manager07.html"><em>website</em></a>. If you disable or refuse cookies, please note that all or some parts of the Loom Services, may then be inaccessible or not function properly.</p>

              <p><strong>Promotional Offers from Loom.</strong> If you do not wish to have your e-mail address/contact information used by Loom to promote our own or third parties' products or services, you can opt-out through the unsubscribe mechanism at the bottom of the applicable email. This opt out does not apply to information provided to Loom as a result of a service or product purchase, warranty registration, product service experience or other transactions. &nbsp;</p>

              <p>We do not control third parties' collection or use of your information to serve interest-based advertising. You may be able to opt out of receiving personalized advertisements from companies who are members of the Network Advertising Initiative or who subscribe to the Digital Advertising Alliance's Self-Regulatory Principles for Online Behavioral Advertising. For more information about this practice and to understand your options, please visit: <a href="http://www.aboutads.info">http://www.aboutads.info</a> and <a href="http://www.networkadvertising.org/choices/">http://www.networkadvertising.org/choices/</a>. You may also use TRUSTe's Preference Manager at <a href="http://preferences-mgr.truste.com">http://preferences-mgr.truste.com</a>. &nbsp;</p>

              <p>&nbsp;</p>

              <p><strong>Accessing and Correcting Your Information</strong></p>

              <p>You may change, correct or delete any personal information that you have provided to us through the settings tab of your user dashboard. You may also do this by contacting us by e-mail at support@joinoom.com. We may not accommodate a request to change information if we believe the change would violate any law or legal requirement or cause the information to be incorrect.&nbsp;</p>

              <p>If you delete your User Content from any of the Loom Services (including any User Content stored in the cloud), copies of your User Content may remain viewable in cached and archived pages, or might have been copied or stored by other users of the Servers or the Site. Proper access and use of information provided on or through any of the Loom Services, including User Content, are governed by the Terms.&nbsp;</p>

              <p><strong>Your California Privacy Rights</strong></p>

              <p>California Civil Code Section § 1798.83 permits users of the Site that are California residents to request certain information regarding our disclosure of personal information to third parties for their direct marketing purposes. To make such a request, please send an e-mail to support@joinloom.com or write to us at: Loom Labs, Inc.,501 Pedernales 1B, Austin, Texas 78702, USA.</p>

              <p><strong>Data Security</strong></p>

              <p>We understand that the security of your personal information is important. We provide reasonable administrative, technical, and physical security controls to protect your personal information.&nbsp; However, despite our efforts, no security controls are 100% effective and Loom cannot ensure or warrant the security of your personal information. Any transmission of personal information is at your own risk. We are not responsible for circumvention of any privacy settings or security measures contained on the Site. &nbsp;</p>

              <p>The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a password for access to and use of certain parts of the site, the Development Services and/or the other Loom Services, you are responsible for keeping this password confidential. We ask you not to share your password with anyone. We urge you to be careful about giving out information in public areas of any of the Loom Services. The information you share in public areas may be viewed by any Company, Contractor or other user of the Site.</p>

              <p><strong>Changes to Our Privacy Policy&nbsp;</strong></p>

              <p>It is our policy to post any changes we make to our privacy policy on this page with a notice that the privacy policy has been updated on the home pages of the Site for at least 30 days. If we make material changes to how we treat our users' personal information that are materially less protective than provided in this policy, we will use reasonable efforts to notify you by e-mail to the e-mail address specified in your account and/or through a notice on the home pages of the Site and to attempt to get your consent to the changes. The date the privacy policy was last updated is identified above. You are responsible for ensuring that we have an up-to-date active and deliverable e-mail address for you, and for periodically visiting the Site and this privacy policy to check for any changes.&nbsp; Like our Terms, of which this privacy policy is a part, your use, and/or continued use after our efforts to contact you, of the Site, the Development Services or any of the other Loom Services, means that you agree to be bound by such&nbsp;changes.</p>

              <p><strong>Survival</strong></p>

              <p>The policies indicated in this privacy policy will remain effective, even if the Terms and the other agreements between us are terminated and you are no longer using the Site, the Development Services or any of the other Loom Services.</p>

              <p><strong>&nbsp;Contact Information</strong></p>

              <p>To ask questions or comment about this privacy policy and our privacy practices or need to reach us for any other reason, you may contact us by e-mail at support@joinloom.com or by mail at Loom Labs, Inc., 501 Pedernales 1B, Austin, Texas 78702 USA.</p>

              <p>© Copyright Loom Labs, Inc. 2016</p>

          </div>
      )
    }
  });

  const DMCA = React.createClass({
    render () {
      return (
       <div>
      <h2>Careers</h2>
      <p>DMCA Policy</p>

        <p>Effective starting: August 8, 2016</p>

        <p>Loom Labs, Inc. (“<strong>Loom Labs</strong>”) respects the intellectual property rights of others and expects its users to do the same as described in this policy. This policy is incorporated by reference into the Terms of Service (the “<strong>Terms of Service</strong>”). Defined terms used in this policy that are not otherwise defined herein shall have the same definitions as in the Terms of Service.</p>

        <p>We do not allow copyright infringing activities on our Site or through our services (“<strong>Services</strong>”) and will remove a party’s Content from the Site or our Services if properly notified that such Content infringes on another's copyright rights. Loom Labs has a policy of terminating, in appropriate circumstances and at our discretion, to disable and/or terminate the accounts of Users who repeatedly infringe or are repeatedly charged with infringing the copyrights or other intellectual property rights of others.&nbsp; You are a “repeat infringer” if, on more than two occasions, you have been notified of infringing activity or have had your Content removed from our Site or our Services. We also reserve the right in our discretion to terminate any of your accounts suspected of infringing copyrights upon the first incident without further notice, at our sole discretion.</p>

        <p>If you believe that any Content on our Site or in our Services violates your copyright, you should notify Loom Labs copyright agent in writing pursuant to the Digital Millennium Copyright Act (“<strong>DMCA</strong>”), 17 U.S.C. § 512(c)(3). The contact information for our copyright agent is below.</p>

        <p>In order for Loom Labs to take action, you must do the following in your written notice (the “<strong>DMCA Takedown Notice</strong>):</p>

        <p>Your physical or electronic signature.</p>

        <p>Identification of the copyrighted work you believe to have been infringed or, if the claim involves multiple works on the Site or in the Services, a representative list of such works.</p>

        <p>Identification of the material you believe to be infringing in a sufficiently precise manner to allow us to locate that material.</p>

        <p>Adequate information by which we can contact you (including your name, postal address, telephone number and, if available, e-mail address).</p>

        <p>A statement that you have a good faith belief that use of the copyrighted material is not authorized by the copyright owner, its agent or the law.</p>

        <p>A statement that the information in the written notice is accurate.</p>

        <p>A statement, under penalty of perjury, that you are authorized to act on behalf of the copyright owner.</p>

        <p>We will promptly notify the alleged infringer that you have claimed ownership of the rights in this Content and that we have complied with your DMCA Takedown Notice for the Content.</p>

        <p>Here is the contact information for our copyright agent:</p>

        <p>Loom Labs, Inc.&nbsp;</p>

        <p>501 Pedernales 1B</p>

        <p>Austin, Texas 78702&nbsp;<br />
        Attn: Copyright Agent<br />
        E-Mail: <a href="mailto:copyright@atlassian.com">copyright@joinloom.com</a></p>
        </div>
      )
    }
  });

	const AboutLoom = React.createClass({
		render() {
			return (
					<div>
						<h1 className="text-brand brand-bold text-center">
              Loom is a platform that weaves together ideas, equity and code.
            </h1>


            <h3 className="brand text-center">
              We enthusiastically connect passionate visionaries with talented
              developers to bring digital products to life.
            </h3>
            <p>&nbsp;</p>
            <p>
              In addition to equity compensation, Loom also supports cash compensation for work.
            </p>
            <p>
              With an emphasis on building quality digital products in exchange for equity, freelancers on Loom can display their technical proficiencies using our integrated testing service, allowing entrepreneurs to easily find the talent they need. Loom also includes all necessary legal contract templates to engage a qualified freelancer, which are then auto-generated and signed electronically directly through the platform.
            </p>
            <p>
              Our goal with Loom is to create a platform that empowers anyone to actualize their ideas into powerful products without the need for raising venture funding. We believe that some of the world’s best ideas are trapped in the minds of non-technical people. And now, Loom is here to help bring those ideas to life by connecting entrepreneurs directly with technical freelancers willing to work for cash or equity.
            </p>
            <p>
              According to the Bureau of Labor Statistics, employment of web developers is projected to grow 27 percent from 2014 to 2024, much faster than the average for all occupations. And more generally, there are about 15 million freelance workers in the US. That number is expected to grow to over 60 million by 2020.
            </p>
            <p>
              With such high demand for a work-for-equity platform, all freelancers on Loom are rated and reviewed using integrated functionality to ensure quality. Entrepreneurs are also encouraged to chat with freelancers through the platform and see their work history to further qualify them for a given project.
            </p>
            <p>
              Posting a project on Loom is free for entrepreneurs, after which the freelance community can bid on the project in equity or cash offers. As the project’s manager, entrepreneurs can filter all of their bids by equity offer, cash offer, quality or location, then hire any developer of their choosing to complete the project for a small engagement fee. Once a bid is accepted, all industry-standard legal contracts are auto-generated and electronically delivered to both parties to commence the project.
            </p>
            <p>
              On Loom, we charge the hiring party a fee of $3-per-hour of the estimated work to engage any developer on a project. As it is free to post projects on Loom and receive bids from developers around the world, companies only pay a fee if they receive a bid they like and choose to engage a freelancer on their project.
            </p>
            <p>
              Our goal is to never charge fees to contractors on Loom.
            </p>
            <p>
              We’re proud to have you as a contributor to the first work-for-equity platform. Our goal is to connect the brightest, passionate minds together for mutual interest in bringing some of the world’s best ideas to life.
            </p>
            <p>
              Loom is proudly based in Austin, Texas.
            </p>
            <p>
              Raise ideas, not funds, on Loom.
            </p>
					</div>
			)
		}
	});

	const Contact = React.createClass({
		render() {
			return (
					<div>
            <h1 className="text-brand brand-bold text-center">
              Hey, there. We want to hear what you have to say.
            </h1>


            <h3 className="brand text-center">
              We’re proud of our community and thrive on your feedback.
            </h3>
            <p>&nbsp;</p>
            <p>
              To contact Loom regarding support-related issues, please send a detailed email to <a href='mailto:support@joinloom.com'>support@joinloom.com</a> with your request.
            </p>

            <p>
              To contact Loom regarding all other issues, please send a detailed email to <a href='mailto:info@joinloom.com'>info@joinloom.com</a> and we’ll get back to you as quickly as possible.
            </p>

            <p>
              Please note that our community support center can help with most questions you may have and is located at joinloom.zendesk.com
            </p>

            <p>
              You can find us eating tacos and drinking Topo in our office located in the lovely city of Austin, Texas. Our address is:
            </p>

            <p>
            <strong>
              Loom Labs, Inc. <br />
              501 Pedernales, 1B <br />
              Austin, Texas 78702
            </strong>
            </p>
					</div>
			)
		}
	});

	const AboutCareers = React.createClass({
		render() {
			return (
					<div>
						<h1 className="text-brand brand-bold text-center">
              Join the ranks. We’re a lean, passionate team of builders.
            </h1>


            <h3 className="brand text-center">
            Our mission is to help people around the world actualize their
            ideas with the resources they have for mutual benefit. And we’re
            looking for talented people who believe in this mission to join us
            as we redefine how the world works.
            </h3>
            <p>&nbsp;</p>
            <p>
              We’re specifically on the lookout for both a talented marketing lead,
              as well as a product designer to join our team. If you think you might
              be a good fit for either of these roles, email your information to
              <a href='mailto:info@joinloom.com'>info@joinloom.com</a> and someone
              will be in touch with more information about the position.
            </p>
            <p>
              More roles will be available on the team in the near future, so be sure
              to follow us on our social channels and sign up for our newsletter for more
              information as it becomes available. Be sure to also check back here, as we
              will update this page as we have more concrete details about future roles.
            </p>
            <p>
              Loom is proudly an equal opportunity employer based in Austin, Texas.
              <i className="emoji-peace"></i>
            </p>

					</div>
			)
		}
	});

	if(aboutDiv) {
		const browserHistory = useRouterHistory(createHashHistory)({ queryKey: false });

		// remember to update the list of routes in the AboutPage component to match this. I'd like to consolidate the router configuration at some point.
		ReactDOM.render((
			<Router history={browserHistory}>
					<Route path="/" component={AboutPage}>
						<IndexRedirect to="/about" />
						<Route path="/about">
							<Route path="careers" component={AboutCareers}/>
              <Route path="privacy" component={Privacy}/>
              <Route path="terms-of-service" component={Terms}/>
              <Route path="dmca" component={DMCA}/>
              <Route path="contact" component={Contact}/>
							<IndexRoute component={AboutLoom}/>
						</Route>
						<Route path="*" component={AboutLoom}/>
					</Route>
			</Router>
		), aboutDiv);
	}
})();