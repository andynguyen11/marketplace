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

module.exports = SkillButton;