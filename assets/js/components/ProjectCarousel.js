import React from 'react'
import Slider from 'react-slick'

function Stat({project, statName, type}){
  return project[statName] ? (
    <div className={`plate-stat ${ project.mix ? 'mix' : 'xor' }`}>
      <div className="plate-stat-amount">{ project[statName] }</div>
      <div className="plate-stat-type">{ type }</div>
    </div>
  ) : null
}

function backgroundImage(image){
  return image ? {backgroundImage: `url('${ image }')`} : {}
}
function ProjectSlide({project, ...props}){
  return (
    <a className="plate" href={loom_api.projectUrl(project.slug)} {...props} style={{display: 'flex'}}>
      <div className="plate-image" style={ project.image ? backgroundImage(project.image.file) : {}} />
      <div className="plate-info">
        <div className="plate-info-profile">
          <div className="plate-info-profile-photo" style={ backgroundImage(project.project_manager.get_photo) } />
          <div className="plate-info-profile-name">
            <div className="plate-info-profile-name--primary">{ project.project_manager.name }</div>
            { project.company && ( <div className="plate-info-profile-name--secondary">{ project.company.name }</div>)}
          </div>
        </div>
        <div className="plate-info-project">
          <h4 className="plate-info-project-name">{ project.title }</h4>
          <p className="plate-info-project-description">{ project.short_blurb }</p>
        </div>
      </div>
      <div className="plate-stats">
        <Stat project={project} statName='estimated_equity_percentage' type='Equity'/>
        <Stat project={project} statName='estimated_cash' type='Cash'/>
      </div>
    </a>
  )
}
function PrevButton({ onClick }) {
  return <button onClick={onClick} className="slick-prev" style={{ fontSize: '2em', color: '#ccc', marginTop: '-2em' }}>
    <span className="glyphicon glyphicon-chevron-left"/>
  </button>
}
function NextButton({ onClick }) {
  return <button onClick={onClick} className="slick-next" style={{ fontSize: '2em', color: '#ccc', marginTop: '-2em' }}>
    <span className="glyphicon glyphicon-chevron-right"/>
  </button>
}

let ProjectSlider = React.createClass({
  render: function () {
    var settings = {
      dots: false, infinite: false, speed: 500,
      slidesToShow: 3, slidesToScroll: 3,
      className: "plates-inner",
      prevArrow: <PrevButton/>,
      nextArrow: <NextButton/>,
    };
    return (
      <Slider {...settings}>
        {this.props.projects.map(project => ProjectSlide({key: project.id, project}))}
      </Slider>
    );
  }
});

export default ProjectSlider
