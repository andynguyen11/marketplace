import React from 'react';
import classNames from 'classnames';

const isDescendant = function(parent, child) {
  var node = child.parentNode;
  while (node != null) {
    if (node == parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

const PrettySelect = React.createClass({
  getInitialState() {
    return {
      optionsShown: false
    }
  },

  propType: {
    prefix: React.PropTypes.string,
    selection: React.PropTypes.string.isRequired,
    suffix: React.PropTypes.string,
    name: React.PropTypes.string,
    id: React.PropTypes.string,
    position: React.PropTypes.string
  },

  openMenu(event) {
    const { optionsShown } = this.state;

    event.stopPropagation();

    if(!optionsShown) {

      this.setState({optionsShown: true}, () => {
        this.watchWindow();
      });
    }else{
      this.setState({ optionsShown: false }, () => {
        this.watchWindow();
      })
    }
  },

  closeMenu() {
    this.setState({ optionsShown: false }, () => {
      this.watchWindow();
    })
  },

  watchWindow() {
    const { optionsShown } = this.state;

    if(optionsShown) {
      window.addEventListener('click', this.whenClick);
    }else{
      window.removeEventListener('click', this.whenClick);
    }
  },

  whenClick(event) {
    const menu = this.refs.menu;
    const clickTarget = event.target;
    const isTarget = clickTarget === menu;
    const isChild = isDescendant(menu, event.target);
    const isSame = isTarget || isChild;

    if(!isSame || isChild) {
      this.closeMenu();
    }
  },

  render() {
    const { className, prefix, suffix, selection, children, position } = this.props;
    const { optionsShown } = this.state;

    const prettySelectClass = 'prettySelect' + (className && ' ' + className || '');
    const prefixComponent = prefix && <div className="prettySelect-prefix">{prefix}</div>;
    const optionComponent = selection && <div className="prettySelect-selection" onClick={this.openMenu}>{selection} <i className="fa fa-angle-down"></i></div>;
    const suffixComponent = suffix && <div className="prettySelect-suffix">{suffix}</div>;

    const optionMenu = (() => {
      const menuClass = classNames('prettySelect-option-menu', {
        'prettySelect-option-menu--shown': optionsShown,
        'prettySelect-option-menu--right': position === 'right',
        'prettySelect-option-menu--left': position === 'left'
      });

      return (
        <div className={menuClass} ref="menu">
          {children}
        </div>
      );
    })();

    return (
      <div className={prettySelectClass}>
        {prefixComponent}
        {optionComponent}
        {suffixComponent}
        {optionMenu}
      </div>
    );
  }
});

export default PrettySelect;