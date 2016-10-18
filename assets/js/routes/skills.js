import React from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';

import Button from '../SPAcomponents/button';
import { ContentTile, ContentTileEmptyState } from  '../SPAcomponents/tile';
import { RankBadge } from '../SPAcomponents/badges';
import PrettySelect from '../SPAcomponents/prettySelect';
import Loader from '../SPAcomponents/loader';

const getLastItem = (arr) => {
  if(arr) {
    const lastIndex = arr.length;
    const lastItem = arr[lastIndex - 1];

    return lastItem;
  }

  return false;
};

const getTestScore = (total, score) => {
  const scoreNormalized = total * (score / 100);

  return scoreNormalized + '/' + total;
};

const TableTests = React.createClass({
  render() {
    const { children } = this.props;

    return (
      <table className="skills-table">
        {children}
      </table>
    );
  }
});

const TableTestsHeader = React.createClass({
  render() {
    return (
      <thead className="hide-mobile">
        <tr>
          <th>Name</th>
          <th>Questions</th>
          <th>Est. Time</th>
          <th></th>
        </tr>
      </thead>
    );
  }
});

const TableTestsRow = React.createClass({
  propTypes: {
    testName: React.PropTypes.any.isRequired,
    questionCount: React.PropTypes.any.isRequired,
    estimatedTime: React.PropTypes.any.isRequired,
    buttonText: React.PropTypes.any.isRequired,
    onButtonClick: React.PropTypes.func.isRequired
  },

  render() {
    const { testName, questionCount, estimatedTime, buttonText, onButtonClick } = this.props;

    return (
      <tr>
        <td className="skills-test-name">{testName}</td>
        <td className="hide-mobile">{questionCount}</td>
        <td className="hide-mobile">{estimatedTime}</td>
        <td className="hide-mobile">
          <Button buttonType="primary" className="skills-test-button" onClick={onButtonClick}>{buttonText}</Button>
        </td>
      </tr>
    );
  }
});

const TableTestsCategoryHeader = React.createClass({
  propTypes: {
    skillName: React.PropTypes.any.isRequired
  },

  render() {
    const { skillName } = this.props;

    return (
      <tr className="skills-test-category">
        <td colSpan="2">{skillName}</td>
        <td className="hide-mobile"></td>
        <td className="hide-mobile"></td>
      </tr>
    );
  }
});

const TestsTaken = React.createClass({
  getTestStatus(result) {
    switch (result) {
      case 'PASS':
        return 'Passed';
        break;
      case 'FAIL':
        return 'Failed';
        break;
      case 'INPROGRESS':
      default:
        return 'In Progress';
        break;
    }
  },

  render() {
    const { tests, takeTest } = this.props;

    const categoriesList = tests.map((category, categoryKey) => {
      const { skillName, tests } = category;

      const testsList = tests.map((test, testKey) => {
        const { testName, testUrl, stats: { questions, average_score } } = test;
        const mostRecentResult = getLastItem(test.results);
        const { percentile, score, result } = mostRecentResult;

        const status = this.getTestStatus(result);
        const badge = result === 'PASS' && <RankBadge percentile={percentile} score={score} average={average_score}/>;

        const testClass = classNames({
          'skills-test-status--passed': result === 'PASS',
          'skills-test-status--failed': result === 'FAIL',
          'skills-test-status--inprogress': result === 'INPROGRESS'
        });

        const scoreDisplay = result !== 'INPROGRESS' && getTestScore(questions, score);

        const buttonText = result === 'INPROGRESS' ? 'Resume' : 'Retake';
        const buttonType = result === 'INPROGRESS' ? 'secondary' : 'tertiary';
        const takeThisTest = () => {
          takeTest(testUrl);
        };

        return (
          <tr className={testClass} key={testKey}>
            <td className="skills-test-name">{testName}</td>
            <td className="skills-test-status">{status}</td>
            <td className="skills-test-stat hide-mobile">{scoreDisplay}</td>
            <td className="skills-test-badge hide-mobile">
              {badge}
            </td>
            <td className="hide-mobile">
              <Button buttonType={buttonType} className="skills-test-button" onClick={takeThisTest}>{buttonText}</Button>
            </td>
          </tr>
        );
      });

      return (
        <tbody key={categoryKey}>
          <tr className="skills-test-category">
            <td colSpan="2">{skillName}</td>
            <td className="hide-mobile"></td>
            <td className="hide-mobile"></td>
            <td className="hide-mobile"></td>
          </tr>
          {testsList}
        </tbody>
      );
    });

    return (
      <ContentTile header="Your Tests">
        <table className="skills-table">
          <thead className="hide-mobile">
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Score</th>
              <th>Rank</th>
              <th></th>
            </tr>
          </thead>
          {categoriesList}
        </table>
      </ContentTile>
    );
  }
});

const RecommendedTests = React.createClass({
  render() {
    const { tests, takeTest } = this.props;

    const categoriesList = tests.map((category, categoryKey) => {
      const { skillName, tests } = category;

      const testsList = tests && tests.map((test, testKey) => {
        const { testName, testUrl, stats: { questions, estimated_time } } = test;

        const takeThisTest = () => {
          takeTest(testUrl);
        };

        return <TableTestsRow key={testKey} testName={testName} questionCount={questions} estimatedTime={estimated_time} buttonText="Take Test" onButtonClick={takeThisTest}/>;
      });

      return (
        <tbody key={categoryKey}>
          <TableTestsCategoryHeader skillName={skillName}/>
          {testsList}
        </tbody>
      );
    });

    const tileHeader = <span>Recommended Tests <span className="hide-xs">(based on your skills)</span></span>;

    return (
      <ContentTile header={tileHeader}>
        <table className="skills-table">
          <TableTestsHeader/>
          {categoriesList}
        </table>
      </ContentTile>
    );
  }
});

const AllTests = React.createClass({
  getInitialState() {
    return {
      currentCategory: null
    }
  },

  selectSkill(skillId) {
    const { categories } = this.props;
    const currentCategory = categories[skillId];

    this.setState({ currentCategory });
  },

  render() {
    const { currentCategory } = this.state;
    const { categories, isOnlyTable, takeTest } = this.props;

    const categoryIsSelected = !!currentCategory;
    const testsListHeader = categoryIsSelected && <TableTestsHeader/>;
    const testsList = categoryIsSelected && currentCategory.tests.map((test, testKey) => {
      const { testName, testUrl, stats: { questions, estimated_time } } = test;

      const takeThisTest = () => {
        takeTest(testUrl);
      };

      return <TableTestsRow key={testKey} testName={testName} questionCount={questions} estimatedTime={estimated_time} buttonText="Take Test" onButtonClick={takeThisTest}/>;
    });

    const noCategory = !categoryIsSelected && <ContentTileEmptyState>Please select a skill above to see tests.</ContentTileEmptyState>;

    const skillSelectorOptions = categories.map((category, categoryKey) => {
      const { skillName } = category;
      const chooseCategory = (event) => {
        event.preventDefault();

        this.selectSkill(categoryKey);
      };

      return (
        <div className="skills-test-selector-option" key={categoryKey}>
          <a href="" onClick={chooseCategory}>{skillName}</a>
        </div>
      );
    });

    const tileHeaderText = isOnlyTable ? 'Tests' : 'Other Tests';
    const selectorText = categoryIsSelected ? currentCategory.skillName : 'choose a skill';
    const selectorPrefix = <span className="hide-xs">Sort by:</span>;
    const tileHeader = (
      <div className="tile-header-inner">
        <div className="tile-header-left">
          {tileHeaderText}
        </div>
        <div className="tile-header-right">
          <PrettySelect prefix={selectorPrefix} selection={selectorText} className="skills-test-selector" position="right">
            <div className="skills-test-selector-inner">
              {skillSelectorOptions}
            </div>
          </PrettySelect>
        </div>
      </div>
    );

    return (
      <ContentTile header={tileHeader} overflow={true}>
        <TableTests>
          {testsListHeader}
          <tbody>
            {testsList}
          </tbody>
        </TableTests>
        {noCategory}
      </ContentTile>
    );
  }
});

const SkillsPage = React.createClass({
  getInitialState() {
    return {
      skillsLists: {},
      isLoading: true
    };
  },

  componentWillMount() {
    this.fetchSkillsLists();
  },

  fetchSkillsLists() {
    // setTimeout(() => {
    //   this.setState({
    //     skillsLists: sampleSkillsObj,
    //     isLoading: false
    //   });
    // }, 3000);

    const { userId } = this.props;

    if(userId){
      $.ajax({
        url: loom_api.profile + userId + '/skillsummary/',
        method: 'GET',
        success: (result) => {
          this.setState({
            skillsLists: result,
            isLoading: false
          });
        },
        error: (xhr, status, error) => {
          console.error(xhr, status, error);
        }
      });
    }
  },

  takeTest(testUrl) {
    $.ajax({
      url: testUrl,
      method: 'GET',
      success: (result) => {
        console.log(result);
      },
      error: (xhr, status, error) => {
        console.error(xhr, status, error);
      }
    });
  },

  render() {
    const { isLoading, skillsLists: { testsTaken, testsRecommended, testsNotTaken } } = this.state;

    if(isLoading) {
      return <Loader/>;
    }

    const hasTestsTaken = testsTaken && !!testsTaken.length;
    const hasTestsRecommended = testsRecommended && !!testsRecommended.length;
    const hasTestsNotTaken = testsNotTaken && !!testsNotTaken.length;
    const hasNoTests = !hasTestsTaken && !hasTestsRecommended && !hasTestsNotTaken;

    if(hasNoTests) {
      return (
        <ContentTile>
          <ContentTileEmptyState>
            Oops! Looks like there are no tests available.
          </ContentTileEmptyState>
        </ContentTile>
      );
    }

    const testsTakenTable = hasTestsTaken && <TestsTaken tests={testsTaken} takeTest={this.takeTest}/>;
    const testsRecommendedTable = hasTestsRecommended && <RecommendedTests tests={testsRecommended} takeTest={this.takeTest}/>;
    const showOnlyTestsNotTaken = !hasTestsTaken && !hasTestsRecommended;
    const testsNotTakenTable = testsNotTaken.length && <AllTests categories={testsNotTaken} isOnlyTable={showOnlyTestsNotTaken} takeTest={this.takeTest}/>;

    return (
      <div className="skills">
        {testsTakenTable}
        {testsRecommendedTable}
        {testsNotTakenTable}
      </div>
    );
  }
});

const skillsDiv = document.getElementById('skills');

if(skillsDiv) {
  const userId = skillsDiv.dataset.id;

  ReactDOM.render(<SkillsPage userId={userId}/>, skillsDiv);
}