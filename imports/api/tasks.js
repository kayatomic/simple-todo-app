import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check'; 

export const Tasks = new Mongo.Collection('tasks');

Meteor.methods({
	'tasks.insert' (text) {
		check(text, String);

		// Make sure the user is logged in before inserting a task
		if (!Meteor.userId()) {
			throw new Meteor.Error('not-authorized, please log in');
		}

		Tasks.insert({
			text,
			createdAt: new Date(),
			owner: Meteor.userId(),
			username: Meteor.user().username,
			is_edit: false
		});
	},

	'tasks.remove' (taskId) {
		check(taskId, String);

		Tasks.remove(taskId);
	},

	'tasks.isOwner' (task){
		if (Meteor.userId() !== task.owner){
			return false;
		} else {
			return true;
		}
	},

	'tasks.setChecked' (taskId, setChecked) {
		check(taskId, String);
		check(setChecked, Boolean);

		Tasks.update(taskId, {
			$set: {
				checked: setChecked
			}
		});
	},

	'tasks.toggleEdit' (taskId, setEdited) {
		check(taskId, String);
		check(setEdited, Boolean);

		Tasks.update(taskId, {
			$set: {
				is_edit: setEdited
			}
		});
	},

	'tasks.edit' (taskId, editedTask) {
		check(taskId, String);
		check(editedTask, String);

		Tasks.update(taskId, {
			$set: {
				text: editedTask,
				is_edit: false,
				updatedAt: new Date()
			},
		});
	},

});