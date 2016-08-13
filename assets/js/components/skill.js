import React from 'react';
import _ from 'lodash';

let SkillButton = React.createClass({
  changeState(e) {
    this.props.update_skills($(e.currentTarget).data('skill'));
  },
  render() {
      const { skill, mySkills } = this.props;
      let active = mySkills.indexOf(skill.id) >= 0 ? 'active' : '';
      return (
        <div className={'btn btn-skill text-center ' + active} onClick={this.changeState} data-skill={skill.id} >
          {this.props.skill.name}
        </div>
      );
  }
});

export class SkillWidget extends React.Component {

    state = { selectedSkills: {}, allSkills: [] }

    componentDidMount =_=> {
        if(this.props.skills){
            this.setState({allSkills: this.props.skills})
        } else {
            $.get(loom_api.skills, allSkills => {
                this.setState({allSkills})
            })
        }
    }

    update_skills = skill_id => {
        let selectedSkills = Object.assign({},
            this.state.selectedSkills,
            {[skill_id]: !this.state.selectedSkills[skill_id]}
        )
        this.setState({selectedSkills})
        this.props.onChange(Object.keys(selectedSkills).filter(id => selectedSkills[id]).map(id => parseInt(id)))
    }

    render(){
      const { mySkills } = this.props;

      return (
        <div className='panel panel-default panel-skills'>
          { this.state.allSkills.map( (skill, i) => (
              <div key={i} className="pull-left">
                  <SkillButton
                    skill={skill}
                    update_skills={this.update_skills}
                    mySkills={mySkills}
                  />
              </div>
          ) ) }
          <div className='clearfix'></div>
        </div>
      )
    }
}

export default SkillButton
