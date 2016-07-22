import React from 'react'

let SkillButton = React.createClass({
  getInitialState() {
    return {
      active: false
    };
  },
  changeState(e) {
    this.setState({
      active: !this.state.active
    });
    this.props.update_skills($(e.currentTarget).data('skill'));
  },
  render() {
      return (
        <div className={this.state.active ? 'btn btn-skill text-center active' : 'btn btn-skill text-center'} onClick={this.changeState} data-skill={this.props.skill.id} >
          <i className="fa fa-css3"></i> {this.props.skill.name}
        </div>
      );
  }
});

export class SkillWidget extends React.Component {
    state = {}
    update_skills = skill_id => {
        let update = !this.state[skill_id]
        let state = {...this.state, [skill_id]: update}
        this.setState({[skill_id]: update})
        this.props.onChange(Object.keys(state).filter(id => state[id]).map(id => parseInt(id)))
    }
    render(){
        return (
            <div className='panel panel-default panel-skills'>
                { this.props.skills.map( (skill, i) => (
                    <div key={i} className="pull-left">
                        <SkillButton
                            skill={skill}
                            update_skills={this.update_skills}
                        />
                    </div>
                ) ) }
                <div className='clearfix'></div>
            </div>
        )
    }
}

export default SkillButton
