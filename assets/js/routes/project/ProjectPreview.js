import React from 'react'

export default function ProjectPreview({data: {title, details, skills, _company_name, _project_manager, ...data }, active, ...props}){
    return ! active ? <div/> : (
        <div id="project" className="section-first" {...props}>
            <div className="row">
                <div className="container">
                    <h2 className="section-header text-center sub-section">
                        { title } <br />
                        <span className="text-yellow">by { _company_name }</span>
                    </h2>
                    <div className="sub-section">
                        <div className="col-md-6">
                            <img className="project-image" src={ details.attachments.filter(a => a.tag == 'image')[0].file.preview } />
                        </div>
                        <div className="specs col-md-3">
                            <h5>THE COMPANY</h5>
                            <ul>
                                <li className="project-hours">
                                    <h5>{ data.estimated_hours }</h5>
                                    est. hours needed
                                </li>
                                <li className="project-equity">
                                    <h5>{ data.estimated_equity_percentage }%</h5>
                                    equity offered
                                </li>
                                <li>
                                    or
                                </li>
                                <li className="project-cash">
                                    <h5>${ data.estimated_cash }</h5>
                                    cash offered
                                </li>
                            </ul>
                            <button className="btn btn-dark" data-toggle="modal" data-target="#bid-modal">BID ON PROJECT</button>
                        </div>
                        <div className="clearfix"></div>
                    </div>
                    <div className="section">
                        <ul className="nav nav-tabs">
                            <li role="presentation" className="active"><a href="#">Overview</a></li>
                            <li role="presentation"><a href="#">Private Information <i className="fa fa-lock"></i></a></li>
                        </ul>
                        <div className="sub-section">
                            <div className="col-md-8">
                                <h2 className="section-header">Project Overview</h2>
                                <div dangerouslySetInnerHTML={{__html: details.description }}/>
                            </div>
                            <div className="col-md-4">
                                <h5>Posted by</h5>
                                <div className="project-byline pull-left">
                                    <p>
                                        <span className="project-manager">{ _project_manager }</span> <br />
                                        <span className="project-company">{ _company_name }</span>
                                    </p>
                                </div>
                                <div className="clearfix"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectPreview;
