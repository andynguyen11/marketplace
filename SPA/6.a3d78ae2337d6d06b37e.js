webpackJsonp([6],{"./app/scripts/components/tabs/tabs.jsx":function(e,t,a){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0}),a("./app/scripts/components/tabs/tabs.scss");var s=a("./node_modules/classnames/index.js"),o=r(s),i=React.createClass({displayName:"Tabs",propTypes:{tabConfig:React.PropTypes.arrayOf(React.PropTypes.shape({name:React.PropTypes.oneOfType([React.PropTypes.string,React.PropTypes.node]).isRequired,component:React.PropTypes.node.isRequired})).isRequired,tabHeaderClass:React.PropTypes.string,tabContentClass:React.PropTypes.string},getInitialState:function(){return{activeTabIndex:0}},componentWillMount:function(){this.setActiveTab(0)},setActiveTab:function(e){this.setState({activeTabIndex:e})},getTabs:function(){var e=this,t=this.props.tabConfig,a=this.state.activeTabIndex;return t.map(function(t,r){var s=function(){e.setActiveTab(r)},i=(0,o["default"])("tab",{"tab--active":r===a});return React.createElement("div",{className:i,key:r,onClick:s},t.name)})},getActiveTabComponent:function(){var e=this.props.tabConfig,t=this.state.activeTabIndex;return e[t].component},render:function(){var e=this.props,t=e.tabHeaderClass,a=e.tabContentClass,r=(0,o["default"])("tabs-header",t),s=(0,o["default"])("tabs-content",a),i=this.getTabs(),c=this.getActiveTabComponent();return React.createElement("div",{className:"tabs"},React.createElement("div",{className:r},i),React.createElement("div",{className:s},c))}});t["default"]=i},"./app/scripts/components/tabs/tabs.scss":function(e,t,a){t=e.exports=a("./node_modules/css-loader/lib/css-base.js")(),t.push([e.i,".tab,.tabs-header{display:flex}.tab{flex-grow:1;align-items:center;justify-content:center;cursor:pointer}.tab.tab--active{font-weight:700}",""])},"./app/scripts/containers/project/project.jsx":function(e,t,a){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&(t[a]=e[a]);return t["default"]=e,t}function s(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0});var o=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var r in a)Object.prototype.hasOwnProperty.call(a,r)&&(e[r]=a[r])}return e},i="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e};a("./app/scripts/containers/project/project.scss");var c=a("./node_modules/classnames/index.js"),n=s(c),p=a("./node_modules/react-redux/lib/index.js"),l=a("./node_modules/react-router/es6/index.js"),d=a("./node_modules/react-document-meta/dist/index.js"),m=s(d),u=a("./app/scripts/store/actions.js"),g=r(u),b=a("./app/scripts/store/store.js"),f=s(b),j=(a("./app/scripts/store/events.js"),a("./app/scripts/config.js")),P=a("./app/scripts/utils/dateUtils.js"),h=a("./app/scripts/utils/locationUtils.js"),x=a("./app/scripts/components/loader/loader.jsx"),v=s(x),R=a("./app/scripts/components/profilePhoto/profilePhoto.jsx"),y=s(R),E=a("./app/scripts/components/button/button.jsx"),N=s(E),w=a("./app/scripts/components/tabs/tabs.jsx"),T=s(w),_=React.createClass({displayName:"Project",propTypes:{user:React.PropTypes.object,params:React.PropTypes.object,location:React.PropTypes.object,project:React.PropTypes.object},getInitialState:function(){return{isLoading:!0,apiError:!1}},componentWillMount:function(){this.getProject()},getProject:function(){var e=this,t=this.props.params.projectIdOrSlug;f["default"].dispatch(g.fetchProject(t,function(){e.setState({isLoading:!1})},function(t,a){console.error(t),e.setState({isLoading:!1,apiError:a&&a.text||t})}))},tabConfig:function(){var e=this.props.project,t=[{name:React.createElement("span",{id:"projectPage-tab-public"},"Public details"),component:React.createElement(C,{project:e})}];if(e.private_info){var a=e.safe||e.is_project_manager?React.createElement(O,{project:e}):React.createElement(A,{project:e,goToMessages:this.goToMessages,submitProposal:this.submitProposal});t.push({name:React.createElement("span",{id:"projectPage-tab-private"},"Private details ",React.createElement("i",{className:"fa fa-lock","aria-hidden":"true"})),component:a})}return t},submitProposal:function(){var e=this.props.project.slug,t=j.urls.projectProposalUrl(e);l.browserHistory.push({pathname:t})},goToEdit:function(){var e=this.props.project.id,t=j.urls.projectEditUrl(e);l.browserHistory.push({pathname:t})},goToMessages:function(){var e=this.props.project.job.thread_id,t=j.urls.threadUrl(e);l.browserHistory.push({pathname:t})},getMetaTags:function(){var e=this.props.project,t=e.title,a=e.short_blurb,r=e.slug,s=t+" — Loom",o={title:s,description:a,canonical:""+j.urls.base+j.urls.projectUrl(r),meta:{charset:"utf-8"}};return o},render:function(){var e=this,t=this.props.project,a=this.state.isLoading;if(!t||a)return React.createElement(v["default"],null);var r=this.getMetaTags(),s=t.title,o=t.short_blurb,i=t.project_manager_data,c=i.photo_url,n=i.first_name,p=i.city,l=i.state,d=i.country,u=(0,h.getLocationName)(p,l,d),g=function(){var e=t.estimated_cash&&React.createElement(M,{type:"cash",amount:t.estimated_cash}),a=t.estimated_equity_percentage&&React.createElement(M,{type:"equity",amount:t.estimated_equity_percentage}),r=e&&a&&(t.mix?"and":"or"),s=r&&React.createElement("div",{className:"projectPage-bid-andOr"},r);return React.createElement("div",{className:"projectPage-financial"},React.createElement("h3",null,"Project budget"),React.createElement("div",{className:"projectPage-bids-details"},a,s,e))}(),b=function(){var e=t.bid_stats,a=e||{},r=a.averages,s=r.cash&&React.createElement(M,{type:"cash",amount:r.cash,averageBid:!0}),o=r.equity&&React.createElement(M,{type:"equity",amount:r.equity,averageBid:!0}),i=s&&o&&React.createElement("div",{className:"projectPage-bid-slash"},"/"),c=r.combined.cash&&r.combined.equity&&React.createElement(M,{type:"combined",amount:r.combined,averageBid:!0});return(s||o||c)&&React.createElement("div",{className:"projectPage-financial"},React.createElement("h3",null,"Average bid placed"),React.createElement("div",{className:"projectPage-bids-details"},o,i,s),React.createElement("div",{className:"projectPage-bids-details"},c))}(),f=function(){var a=t.is_project_manager,r=t.job,s=r||{},o=s.thread_id;return a?React.createElement(N["default"],{className:"projectPage-bidButton",onClick:e.goToEdit,id:"projectPage-button-edit-project"},"Edit project"):o?React.createElement(N["default"],{className:"projectPage-bidButton",onClick:e.goToMessages,id:"projectPage-button-view-messages"},"View messages"):React.createElement(N["default"],{className:"projectPage-bidButton",onClick:e.submitProposal,id:"projectPage-button-bid"},"Submit a proposal")}(),j=this.tabConfig(),P=t.private_info?React.createElement(T["default"],{tabConfig:j,tabHeaderClass:"projectPage-tabs-header",tabContentClass:"projectPage-tabs-content"}):React.createElement("div",{className:"projectPage-tabs-content"},React.createElement(C,{project:t}));return React.createElement("div",{className:"projectPage"},React.createElement(m["default"],r),React.createElement("div",{className:"projectPage-meta"},React.createElement("div",{className:"projectPage-meta-inner"},React.createElement("h2",{className:"projectPage-title pretty"},s),React.createElement("div",{className:"projectPage-overview"},React.createElement("h3",null,"Project overview"),React.createElement("p",null,o),React.createElement("h3",null,"Project manager"),React.createElement("div",{className:"projectPage-projectManager"},React.createElement("div",{className:"projectPage-projectManager-avatar"},React.createElement(y["default"],{url:c,circle:!0})),React.createElement("div",{className:"projectPage-projectManager-meta"},React.createElement("div",{className:"projectPage-projectManager-name"},n),React.createElement("div",{className:"projectPage-projectManager-location"},u)))),React.createElement("div",{className:"projectPage-bids"},g,b,f))),React.createElement("div",{className:"projectPage-details"},P))}}),M=React.createClass({displayName:"ProjectFinancial",propTypes:{amount:React.PropTypes.oneOfType([React.PropTypes.number,React.PropTypes.string,React.PropTypes.object]).isRequired,type:function(e,t,a){var r=e[t],s=["cash","equity","combined"];if(!s.includes(r))return new Error("Invalid prop `"+t+"` supplied to `"+a+"`. Validation failed.")},averageBid:React.PropTypes.bool},formatAmount:function(e,t){var a="cash"===t?"$"+e:e+"%";return React.createElement("div",{className:"projectPage-bid-amount"},a)},render:function(){var e=this.props,t=e.amount,a=e.type,r=e.averageBid,s=r?"avg "+a+" bid":a,o="object"===("undefined"==typeof t?"undefined":i(t)),c=!o&&this.formatAmount(t,a),p=o&&this.formatAmount(t.equity,"equity"),l=o&&React.createElement("div",{className:"projectPage-bid-andOr"},"and"),d=o&&this.formatAmount(t.cash,"cash"),m=(0,n["default"])("projectPage-bid",{"projectPage-bid-combined":o});return React.createElement("div",{className:m},c,p,l,d,React.createElement("div",{className:"projectPage-bid-type"},s))}}),C=React.createClass({displayName:"ProjectDetails",propTypes:{project:React.PropTypes.object.isRequired},render:function(){var e=this.props.project,t=e||{},a=t.background,r=t.progress,s=t.scope,o=t.milestones,i=t.specs,c=t.start_date,n=t.end_date,p=(0,P.convertDateForDisplayLong)(c),l=(0,P.convertDateForDisplayLong)(n);return React.createElement("div",{className:"projectPage-details-inner"},React.createElement("h2",{className:"projectPage-title pretty"},"Project details"),React.createElement("div",{className:"projectPage-details-content"},React.createElement("div",{className:"projectPage-details-description"},React.createElement("h3",null,"Background"),React.createElement("p",null,a),React.createElement("h3",null,"Where we are today"),React.createElement("p",null,r),React.createElement("h3",null,"Scope of work"),React.createElement("p",null,s),React.createElement("h3",null,"Deliverables and specs"),React.createElement("p",null,i)),React.createElement("div",{className:"projectPage-details-timeline"},React.createElement("h3",null,"Project timing"),React.createElement("p",null,"Start date: ",React.createElement("b",null,p),React.createElement("br",null),"End date: ",React.createElement("b",null,l)),React.createElement("h3",null,"Milestones"),React.createElement("p",null,o))))}}),O=React.createClass({displayName:"ProjectDetailsPrivate",propTypes:{project:React.PropTypes.object.isRequired},render:function(){var e=this.props.project,t=e||{},a=t.private_info;return React.createElement("div",{className:"projectPage-details-inner"},React.createElement("h2",{className:"projectPage-title pretty"},"Private Details"),React.createElement("div",{className:"projectPage-details-content"},React.createElement("div",{className:"projectPage-details-private"},React.createElement("h3",null,"Private Information"),React.createElement("p",null,a))))}}),A=React.createClass({displayName:"ProjectDetailsNDARequired",propTypes:{project:React.PropTypes.object.isRequired,submitProposal:React.PropTypes.func.isRequired,goToMessages:React.PropTypes.func.isRequired},render:function(){var e=this.props,t=e.project.job,a=e.submitProposal,r=e.goToMessages,s=t||{},o=s.thread_id,i=o?React.createElement(N["default"],{className:"projectPage-bidButton",onClick:r,id:"projectPage-button-NDA-view-messages"},"View Messages"):React.createElement(N["default"],{className:"projectPage-bidButton",onClick:a,id:"projectPage-button-NDA-bid"},"Bid on Project"),c=o?"You can request an NDA from messaging.":"You can request an NDA from the project owner after submitting a bid.";return React.createElement("div",{className:"projectPage-details-inner"},React.createElement("div",{className:"projectPage-details-content"},React.createElement("div",{className:"projectPage-details-private projectPage-details-private-noNDA"},React.createElement("i",{className:"projectPage-details-private-lock fa fa-lock"}),React.createElement("h3",{className:"brand-bold"},"Private details can be accessed after signing a Non-Disclosure Agreement."),React.createElement("p",null,c),i)))}}),D=function(e){var t=e.auth,a=e.project;return o({user:t},a)};t["default"]=(0,p.connect)(D)(_)},"./app/scripts/containers/project/project.scss":function(e,t,a){t=e.exports=a("./node_modules/css-loader/lib/css-base.js")(),t.push([e.i,".projectPage{background:#fff}.projectPage-meta{padding-bottom:20px}.projectPage-meta-inner{max-width:1100px;min-width:320px;width:100%;margin:auto;padding:20px;display:flex;flex-wrap:wrap;justify-content:space-between}.projectPage-meta-inner h3{font-size:26px;font-family:Walsheim Pro,Myriad Pro,Helvetica,Arial,sans-serif;margin:40px 0 5px}@media (max-width:480px){.projectPage-meta-inner h3{margin-top:30px}}h2.projectPage-title{font-family:Walsheim Pro Bold,Walsheim Pro,Myriad Pro,Helvetica,Arial,sans-serif;font-size:48px;font-weight:700;margin:0;flex-basis:100%;padding:20px 0;-webkit-hyphens:auto;-ms-hyphens:auto;hyphens:auto}@media (max-width:768px){h2.projectPage-title{font-size:36px}}@media (max-width:480px){h2.projectPage-title{font-size:30px}}.projectPage-overview{flex-basis:50%;padding-right:40px}@media (max-width:768px){.projectPage-overview{flex-basis:100%;padding-right:0}}.projectPage-projectManager{display:flex;align-items:center;padding-top:5px}.projectPage-projectManager-avatar{width:55px;height:55px;margin-right:10px}.projectPage-projectManager-avatar .generic-profile-photo{width:100%;padding-bottom:100%}.projectPage-projectManager-name{color:#ff7b5c;font-weight:700;padding-bottom:5px}.projectPage-bids{flex-basis:50%;padding-left:40px}@media (max-width:768px){.projectPage-bids{flex-basis:100%;padding-left:0}}.projectPage-bids-details{display:flex}.projectPage-bid{display:flex;flex-direction:column;margin-left:20px}.projectPage-bid:first-child{margin-left:0}.projectPage-bid-combined{flex-wrap:wrap;flex-direction:row}.projectPage-bids-details+.projectPage-bids-details .projectPage-bid-combined{margin-top:10px}.projectPage-bid-combined .projectPage-bid-amount{margin-left:20px}.projectPage-bid-combined .projectPage-bid-amount:first-child{margin-left:0}.projectPage-bid-combined .projectPage-bid-type{flex-basis:100%}.projectPage-bid-amount,.projectPage-bid-slash{color:#ff7b5c;font-size:32px;font-weight:700;line-height:41.6px}.projectPage-bid-slash{margin-left:20px;text-transform:lowercase}.projectPage-bid-andOr{line-height:41.6px;margin-left:20px;font-weight:700}.projectPage-bid-andOr,.projectPage-bid-type{color:#a19ea8;text-transform:lowercase;font-size:12px}.projectPage-bidButton{margin-top:20px}.projectPage-details-content{display:flex}.projectPage-details-content h3{font-family:Walsheim Pro,Myriad Pro,Helvetica,Arial,sans-serif;font-size:20px;margin-bottom:5px}.projectPage-details-content p{margin:0 0 40px;line-height:1.5}@media (max-width:768px){.projectPage-details-content{display:block}}.projectPage-details-description{flex-basis:65%;padding-right:20px}@media (max-width:768px){.projectPage-details-description{flex-basis:100%;padding:0}}.projectPage-details-timeline{flex-basis:35%;padding-left:20px}@media (max-width:768px){.projectPage-details-timeline{flex-basis:100%;padding:0}}.projectPage-details-private{flex-basis:100%}.projectPage-details-private-noNDA{text-align:center;padding-top:40px;padding-bottom:60px}.projectPage-details-private-lock:before{font-size:75px}.projectPage-details-inner{padding-top:40px}.projectPage-details-inner,.projectPage-tabs-header{max-width:1100px;min-width:320px;width:100%;margin:auto;padding-right:20px;padding-left:20px}@media (max-width:480px){.projectPage-tabs-header{padding-right:10px;padding-left:10px}}.projectPage-tabs-header .tab{flex-grow:0;border:1px solid #c8c6cc;margin-bottom:-1px;padding:10px 20px;border-radius:3px 3px 0 0;background:#dad9dd;font-weight:700}@media (max-width:480px){.projectPage-tabs-header .tab{font-size:12px}}.projectPage-tabs-header .tab.tab--active{background:#fafafa;border-bottom-color:#fafafa}.projectPage-tabs-header .tab+.tab,.projectPage-tabs-header .tab .fa{margin-left:5px}.projectPage-tabs-content{background:#fafafa;border-top:1px solid #c8c6cc}.submitProposal{max-width:768px;min-width:320px;width:100%;margin:auto;padding-right:20px;padding-left:20px}.submitProposal h3{margin-bottom:0}.submitProposal .tile{margin-top:60px}.submitProposal-compensationType{display:flex;flex-wrap:wrap;flex-basis:50%}.submitProposal-compensationType>.form-label{flex-basis:100%}.submitProposal-compensationType.form-set{margin-bottom:0}.submitProposal-compensationType .form-set--radio-item{flex-basis:100%}@media (max-width:768px){.submitProposal-compensationType{flex-basis:100%}}.submitProposal-compensationInput{max-width:200px}.submitProposal-actions{display:flex;align-items:center;flex-wrap:wrap;width:100%;justify-content:flex-end;padding-bottom:40px}.submitProposal-actions .button{flex-shrink:0}.submitProposal-actions .button+.button{margin-left:10px}.submitProposal-list{text-align:left;display:flex;flex-wrap:wrap}.submitProposal-list-item{color:#ff7b5c;font-weight:700;margin:5px 0;display:flex;flex-basis:50%;padding-right:5px}.submitProposal-list-item:before{content:'\\2022';padding-right:5px;color:#423d51}@media (max-width:768px){.submitProposal-list-item{flex-basis:100%}}",""])},"./app/scripts/store/events.js":function(e,t,a){"use strict";function r(e){return e&&e.__esModule?e:{"default":e}}Object.defineProperty(t,"__esModule",{value:!0}),t.eventPublish=t.eventUnsubscribe=t.eventSubscribe=t.events=void 0;var s=a("./node_modules/pubsub-js/src/pubsub.js"),o=r(s);t.events={OPEN_NDA_MODAL:"OPEN_NDA_MODAL",OPEN_CONNECTION_MODAL:"OPEN_CONNECTION_MODAL",OPEN_BID_MODAL:"OPEN_BID_MODAL"},t.eventSubscribe=function(e,t){return e&&t?o["default"].subscribe(e,t):(console.error("eventSubscribe expects two arguments, an event name and a callback"),!1)},t.eventUnsubscribe=function(e){return e?o["default"].unsubscribe(e):(console.error("eventUnsubscribe expects an event name argument"),!1)},t.eventPublish=function(e,t){return e?o["default"].publish(e,t):(console.error("eventPublish expects two arguments, an event name (required) and an event data object (optional)"),!1)}}});