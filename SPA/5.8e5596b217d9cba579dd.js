webpackJsonp([5],{"./app/scripts/containers/projects/awarded/components/projectTile/styles.scss":function(e,t){},"./app/scripts/containers/projects/awarded/index.js":function(e,t,r){"use strict";function n(){return fetch(_.a.awarded+"/",{credentials:"same-origin"})}function a(){return function(e){return e(h.e()),n().then(function(e){if(e.status>200)throw new Error;return e.json()}).then(function(t){return e(h.f(t)),t}).catch(function(t){e(h.d(t))})}}Object.defineProperty(t,"__esModule",{value:!0});var s=r("./node_modules/react/index.js"),o=r.n(s),c=r("./node_modules/react-redux/es/index.js"),i=(r("./node_modules/react-helmet/lib/Helmet.js"),r("./app/scripts/components/tile/tile.jsx")),l=r("./app/scripts/components/button/button.jsx"),p=(r("./app/scripts/containers/proposals/components/proposalList/index.js"),r("./node_modules/react-router-dom/es/index.js")),d=r("./app/scripts/components/profilePhoto/profilePhoto.jsx"),u=(r("./app/scripts/containers/projects/awarded/components/projectTile/styles.scss"),function(e){var t=e.title,r=e.role,n=e.employer,a=e.onMessage,s=e.onInvoice;return React.createElement("div",{className:"project-award-card"},React.createElement("h3",null,r),React.createElement("h2",null,t),React.createElement("div",{className:"project-award-details"},React.createElement("h3",null,"Employer:"),React.createElement("div",{className:"project-manager"},React.createElement(p.b,{to:"/profile/"+n.id},React.createElement("div",{className:"profile-photo"},React.createElement(d.a,{url:n.photo_url})),React.createElement("span",null,n.first_name)),React.createElement(l.a,{buttonType:"secondary",onClick:a},"Message ",n.first_name),React.createElement(l.a,{onClick:s},"Invoice ",n.first_name))))}),m=u,f=("undefined"!=typeof __REACT_HOT_LOADER__&&__REACT_HOT_LOADER__.register(u,"default","/Users/will/development/loom/market-ui/app/scripts/containers/projects/awarded/components/projectTile/index.js"),r("./app/scripts/containers/proposals/actions/api.js")),_=r("./app/scripts/api/urls.js");"undefined"!=typeof __REACT_HOT_LOADER__&&__REACT_HOT_LOADER__.register(n,"fetchAwardedProjects","/Users/will/development/loom/market-ui/app/scripts/api/awarded/index.js");var h=r("./app/scripts/containers/projects/awarded/actions/index.js");"undefined"!=typeof __REACT_HOT_LOADER__&&__REACT_HOT_LOADER__.register(a,"fetchAwardedProjects","/Users/will/development/loom/market-ui/app/scripts/containers/projects/awarded/actions/api.js"),r("./app/scripts/containers/projects/awarded/styles.scss");var E=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),j=function(e){return o.a.createElement("svg",e,o.a.createElement("defs",null,o.a.createElement("clipPath",{id:"a"},o.a.createElement("ellipse",{cx:"20",cy:"115",rx:"19.978",ry:"19.985"}),o.a.createElement("rect",{fill:"#ECECEE",width:"169",height:"15",rx:"3"}),o.a.createElement("rect",{fill:"#ECECEE",x:"55",y:"110",width:"72",height:"15",rx:"3"}),o.a.createElement("rect",{fill:"#ECECEE",y:"26",width:"828",height:"24",rx:"3"}))))};j.defaultProps={className:"notif-skel",width:"828",height:"137",viewBox:"0 0 828 137",xmlns:"http://www.w3.org/2000/svg",clipPath:"url(#a)"};var w=function(e){function t(){return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,t),function(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}(this,(t.__proto__||Object.getPrototypeOf(t)).apply(this,arguments))}return function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}(t,o.a.Component),E(t,[{key:"componentWillMount",value:function(){this.props.params,this.props.dispatch(Object(f.a)()),this.props.dispatch(a())}},{key:"searchProjects",value:function(){this.props.history.push("/projects/")}},{key:"handleMessage",value:function(e){this.props.history.push("/dashboard/messages/"+e+"/")}},{key:"handleInvoice",value:function(){this.props.history.push("/invoices/new/")}},{key:"render",value:function(){var e=this,t=this.props,r=t.awardedProjects;return t.proposals,o.a.createElement("div",null,o.a.createElement("div",{className:"freelancer-projects-container"},r.isFetching&&Array(4).fill(1).map(function(e,t){return o.a.createElement(i.a,{key:t},o.a.createElement(j,null))}),!r.isFetching&&r.list.length>0&&o.a.createElement(o.a.Fragment,null,r.list.map(function(t){return o.a.createElement(i.a,{noPadding:!0},o.a.createElement(m,{title:t.title,role:t.role&&t.role.display_name,employer:Object.assign({},t.project_manager_data,{id:t.project_manager}),onMessage:e.handleMessage.bind(e,t.message),onInvoice:e.handleInvoice.bind(e)}))})),!r.isFetching&&!Boolean(r.list.length)&&o.a.createElement("div",{className:"tile-empty-state"},o.a.createElement("p",null,"You have not been awarded any projects yet.",o.a.createElement("br",null)," Discover projects and submit proposals to be awarded a project."),o.a.createElement(l.a,{onClick:this.searchProjects.bind(this)},"Discover projects"))))}}]),t}(),y=Object(c.b)(function(e){return{user:e.auth,proposals:e.proposals,awardedProjects:e.awarded}})(w);t.default=y,"undefined"!=typeof __REACT_HOT_LOADER__&&(__REACT_HOT_LOADER__.register(w,"FreelancerProjectsContainer","/Users/will/development/loom/market-ui/app/scripts/containers/projects/awarded/index.js"),__REACT_HOT_LOADER__.register(y,"default","/Users/will/development/loom/market-ui/app/scripts/containers/projects/awarded/index.js"))},"./app/scripts/containers/projects/awarded/styles.scss":function(e,t){}});