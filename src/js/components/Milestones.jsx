import React from 'react';
import _ from 'lodash';
import cls from 'classnames';

import format from '../modules/format.js';

import actions from '../actions/appActions.js';

import Icon from './Icon.jsx';
import Link from './Link.jsx';

export default class Milestones extends React.Component {

  displayName: 'Milestones.jsx'

  constructor(props) {
    super(props);
  }

  // Cycle through milestones sort order.
  _onSort() {
    actions.emit('projects.sort');
  }

  _onRefresh() {
    actions.emit('projects.load');
  }

  render() {
    let { projects, project } = this.props;

    console.log('projects', projects);
    console.log('project', project);

    // Show the projects with errors first.
    let errors = _(projects.list).filter('errors').map((project, i) => {
      let text = project.errors.join('\n');
      return (
        <tr key={`err-${i}`}>
          <td colSpan="3" className="repo">
            <div className="project">{project.owner}/{project.name}
              <span className="error" title={text}><Icon name="warning"/></span>
            </div>
          </td>
        </tr>
      );
    }).value();

    // Now for the list of milestones, index sorted.
    let list = [];
    _.each(projects.index, ([ pI, mI ]) => {
      let { owner, name, milestones } = projects.list[pI];
      let milestone = milestones[mI];

      // Filter down?
      if (!(!project || (project.owner == owner && project.name == name))) return;

      list.push(
        <tr className={cls({ 'done': milestone.stats.isDone })} key={`${pI}-${mI}`}>
          <td className="repo">
            <Link
              route={{ 'to': 'milestones', 'params': { owner, name } }}
              className="project"
            >
              {owner}/{name}
            </Link>
          </td>
          <td>
            <Link
              route={{ 'to': 'chart', 'params': { owner, name, 'milestone': milestone.number } }}
              className="milestone"
            >
              {milestone.title}
            </Link>
          </td>
          <td style={{ 'width': '1%' }}>
            <div className="progress">
              <span className="percent">{Math.floor(milestone.stats.progress.points)}%</span>
              <span className={cls('due', { 'red': milestone.stats.isOverdue })}>
                {format.due(milestone.due_on)}
              </span>
              <div className="outer bar">
                <div
                  className={cls('inner', 'bar', { 'green': milestone.stats.isOnTime, 'red': !milestone.stats.isOnTime })}
                  style={{ 'width': `${milestone.stats.progress.points}%` }}
                />
              </div>
            </div>
          </td>
        </tr>
      );
    });

    // Wait for something to show.
    if (!errors.length && !list.length) return false;

    if (project) {
      // Project-specific milestones.
      return (
        <div id="projects">
          <div className="header">
            <a className="sort" onClick={this._onSort}><Icon name="sort"/> Sorted by {projects.sortBy}</a>
            <h2>Milestones</h2>
          </div>
          <table>
            <tbody>{list}</tbody>
          </table>
          <div className="footer" />
        </div>
      );
    } else {
      // List of projects and their milestones.
      return (
        <div id="projects">
          <div className="header">
            <a className="sort" onClick={this._onSort}><Icon name="sort"/> Sorted by {projects.sortBy}</a>
            <h2>Projects</h2>
          </div>
          <table>
            <tbody>
              {errors}
              {list}
            </tbody>
          </table>
          <div className="footer">
            <a onClick={this.props.onToggleMode}>Edit Projects</a>
            <a onClick={this._onRefresh}>Refresh Projects</a>
          </div>
        </div>
      );
    }
  }

}
