import angular from 'angular';
import angularMeteor from 'angular-meteor';
import { Meteor } from 'meteor/meteor';
import { Tasks } from '../../api/tasks.js';

import template from './todosList.html';
 
class TodosListCtrl {
  constructor($scope) {
    $scope.viewModel(this);

    this.subscribe('tasks');

    this.hideCompleted = false;

    this.helpers({
      tasks() {
        const selector = {};

        // If hide completed is checked, filter tasks
        if (this.getReactively('hideCompleted')) {
          selector.checked = {
            $ne: true
          };
        }

        return Tasks.find(selector,{
          sort: {
            createdAt: -1
          }
        });
      },

      incompleteCount() {
        return Tasks.find({
          checked: {
            $ne: true
          }
        }).count();
      },

      //Helper function to know if user is logged in
      currentUser() {
        return Meteor.user();
      }

    })
  }
  
  addTask(newTask) {
    // Insert task into collection
    Meteor.call('tasks.insert', newTask);
 
    // Clear form
    this.newTask = '';
  }

  setChecked(task) {
    // Set the checked property to the opposite of its current value
    Meteor.call('tasks.setChecked', task._id, !task.checked);
  }

  editTask(task, newTask) {
    Meteor.call('tasks.edit', task._id, newTask);
  }

  toggleEdit(task) {
    /*Tasks.update(task._id, {
      $set: {
        is_edit: !task.is_edit
      },
    });*/
    Meteor.call('tasks.toggleEdit', task._id, !task.is_edit);

  }

  // delete task from collection
  removeTask(task) {
    Meteor.call('tasks.remove', task._id);
  }

  // check if current user is owner of tasks
  isOwner(task) {
    if (Meteor.userId() === task.owner){
      return true;
    }
  }

  // set task to private
  setPrivate(task) {
    Meteor.call('tasks.setPrivate', task._id, !task.private);
  }

}

export default angular.module('todosList', [
  angularMeteor
])
  .component('todosList', {
    templateUrl: 'imports/components/todosList/todosList.html',
    controller: ['$scope', TodosListCtrl]
  });