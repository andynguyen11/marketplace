import React from 'react';
import classNames from 'classnames';

export const Badge = React.createClass({
  render() {
    const { children, className } = this.props;
    const badgeClass = classNames('SPAbadge', className);

    return (
      <div className={badgeClass}>
        {children}
      </div>
    );
  }
});

export const RankBadge = React.createClass({
  getBadgeText() {
    const { score, average, percentile } = this.props;

    let badgeText = '';
    let badgeClass = null;

    // currently no average us supplied so let's compare to a percentile of 65
    if(percentile > 65) {
      if(percentile > 95) {
        badgeText = 'Top 5%';
        badgeClass = 'top-5';
      }else if(percentile > 90 && percentile <= 95) {
        badgeText = 'Top 10%';
        badgeClass = 'top-10';
      }else if(percentile > 80 && percentile <= 90) {
        badgeText = 'Top 20%';
        badgeClass = 'top-20';
      }else if(percentile >= 75 && percentile <= 80) {
        badgeText = 'Top 25%';
        badgeClass = 'top-25';
      }else {
        badgeText = 'Above Average';
      }
    }else{
      badgeText = 'Below Average';
    }

    return { badgeText, badgeClass };
  },

  render() {
    const { badgeText, badgeClass } = this.getBadgeText();

    return badgeClass ? <Badge className={badgeClass}>{badgeText}</Badge> : <span className="SPAbadge-nobadge">{badgeText}</span>;
  }
});