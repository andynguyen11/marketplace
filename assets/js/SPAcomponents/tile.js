import React from 'react';
import SPAloader from './loader';
import classNames from 'classnames';

export const ContentTile = React.createClass({
  propTypes: {
    header: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.node
    ]),
    isLoading: React.PropTypes.bool,
    overflow: React.PropTypes.bool
  },

  render() {
    const { children, header, isLoading, overflow } = this.props;
    const tileContent = isLoading ? <SPAloader /> : children;
    const tileClass = classNames('tile', { 'tile--overflow': overflow });

    return (
      <div className={tileClass}>
        <div className="tile-header">
          {header}
        </div>
        <div className="tile-content">
          {tileContent}
        </div>
      </div>
    );
  }
});

export const ContentTileEmptyState = React.createClass({
  render() {
    const { children } = this.props;

    return (
      <div className="tile-empty-state">
        {children}
      </div>
    );
  }
});