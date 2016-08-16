import React from 'react'

export default function ProjectPreview({data: {title, details, skills, _company_name, _project_manager_name, ...data}, active, ...props}) {

  let image = details.attachments.filter(a => a.tag == 'image')[0] || {url: ''};
  let imageUrl = image.file ? image.file.preview : image.url;
  const projectBy = function() {
    return _company_name || _project_manager_name;
  }();
  const cityState = data.city && data.state && (
    <li><img className="icon" src="static 'images/icon-location.png'"/>
      <h4>{data.city}, {data.state}</h4>
    </li>
  );
  const tabCompanyName = _company_name && (
    <span>
      <br />
      <span className="project-company">{_company_name}</span>
    </span>
  );

  const sideRail = (
    <div className="col-md-5 project-details-rail">
      <div className="section">
        <h2 className="brand sub-section brand-bold">Project Manager</h2>
        <img className="project-manager-photo pull-left" src=""/>
        <div className="project-byline pull-left">
          <p>
            <span className="project-manager">{_project_manager_name}</span>
            {tabCompanyName}
          </p>
        </div>
        <div className="clearfix"></div>
      </div>

      <div>
        <h2 className="brand-bold sub-section">Preferred Technology Stack</h2>
        <div className="technology-panel">
          <h5 className="btn btn-dark--clear">skill.name</h5><br />
        </div>
      </div>

      <div className="clearfix"></div>
    </div>
  );

  return !active ? <div/> : (
    <div id="project">
      <div className="row content-wrap">
        <div className="container">
          <div className="project-header">
            <h2 className="brand-bold text-brand text-center text-header-main">
              {title}
            </h2>
            <h4 className="brand text-skinny text-center">
              by {projectBy}
            </h4>
          </div>
          <div className="section">
            <div className="col-md-7 project-header-left">
              <img className="project-image" src="{imageUrl}"/>
              <div className="sub-section">{data.short_blurb}</div>
              <ul className="project-meta sub-section">
                {cityState}
                <li>
                  <img className="icon" src="static 'images/icon-category.png'"/>
                  <h4>{data.type}</h4>
                </li>
              </ul>
            </div>
            <div className="specs col-md-5">
              <h2 className="brand">project budget</h2>


            </div>
            <div className="clearfix"></div>

            <div className="sub-section">
              <ul className="nav nav-tabs">
                <li role="presentation" className="active">
                  <a href="#overview" aria-controls="overview" role="tab" data-toggle="tab">
                    Public Information
                  </a>
                </li>
                <li role="presentation">
                  <a href="#private" aria-controls="private" role="tab" data-toggle="tab">
                    Private Information
                    <i className="fa fa-lock"></i>
                  </a>
                </li>
              </ul>
              <div className="tab-content">
                <div className="tab-pane active" role="tab-panel" id="overview">
                  <div className="col-md-7 project-details">
                    <h2 className="brand-bold sub-section">Project Details</h2>
                    <p>{data.description}</p>
                  </div>
                  {sideRail}
                </div>

                <div className="tab-pane" role="tab-panel" id="private">
                  <div className="col-md-7 project-details">
                    <h2 className="section-header brand-bold">Private Information</h2>
                    <p>{data.description}</p>
                  </div>
                  {sideRail}
                  <div className="clearfix"></div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
        <div className="row">
          <div className="container">
            <h2 className="section-header text-center sub-section">{ title } <br /><span className="text-yellow">by { _company_name ? _company_name : _project_manager_name }</span>
            </h2>
            <div className="sub-section">
              <div className="col-md-6">
                <img className="project-image" src={ imageUrl }/>
              </div>
              <div className="specs col-md-3">
                <h5>THE COMPANY</h5>
                <ul>
                  <li className="project-hours">
                    <h5>{ data.estimated_hours }</h5>
                    est. hours needed
                  </li>
                  <li className="project-cash">
                    <h5>${ data.estimated_cash }</h5>
                    cash offered
                  </li>
                  <li className={ data.estimated_equity_percentage ? '' : 'hidden' }>
                    or
                  </li>
                  <li className={ data.estimated_equity_percentage ? 'project-equity' : 'hidden' }>
                    <h5>{ data.estimated_equity_percentage }%</h5>
                    equity offered
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
                </div>
                <div className="col-md-4">
                  <h5>Posted by</h5>
                  <div className="project-byline pull-left">
                    <p>
                      <span className="project-manager">{ _project_manager_name }</span> <br /><span className="project-company">{ _company_name }</span>
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
