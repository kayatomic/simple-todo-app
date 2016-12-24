import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check'; 

export const Tasks = new Mongo.Collection('tasks');

if (Meteor.isServer) {
	// This code only runs on the server
	// Only publish tasks that are public or belong to the current user
	Meteor.publish('tasks', function tasksPublication() {
		return Tasks.find({
			$or: [{private: {$ne: true}}, {owner: this.userId}],
		});
	});
}

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

		// This code snippet is taken from guide section 10.9
		// Don't really need this since I already hid the delete button from non-owners
		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If task is private, only owner can delete
			throw new Meteor.Error('not-authorized');
		}

		/*if (task.owner !== Meteor.userId()) {
			// If task is private, only owner can delete
			throw new Meteor.Error('not-authorized');
		}*/

		Tasks.remove(taskId);
	},

	'tasks.setPrivate' (taskId, setToPrivate) {
		check(taskId, String);
		check(setToPrivate, Boolean);

		const task = Tasks.findOne(taskId);

		// Maks sure only the task onwer can make a task private
		if (task.owner !== Meteor.userId()) {
			throw new Meteor.Error('not-authorized');
		}

		Tasks.update(taskId, {
			$set: {
				private: setToPrivate,
			}
		});
	},

	'tasks.setChecked' (taskId, setChecked) {
		check(taskId, String);
		check(setChecked, Boolean);

		const task = Tasks.findOne(taskId);
		if (task.private && task.owner !== Meteor.userId()) {
			// If task is private, only owner can check it off
			throw new Meteor.Error('not-authorized');
		}

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