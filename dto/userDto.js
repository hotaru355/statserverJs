module.exports = {

	open : function(db, onUsersOpen) {
		return function(payload) {
			db.collection('users', {
				strict : true
			}, function(err, users) {
				if (err) {
					throw new Error(err);
				}
				onUsersOpen(users, payload);
			});
		};
	},

	findByUserName : function(db, userName, onUserFound) {
		return function(users) {
			users.findOne({
				userName : userName
			}, {
				fields : {
					_id : 1
				}
			}, function(err, userFound) {
				if (!userFound) {
					throw new Error("no user found");
				}
				onUserFound(userFound);
			});
		};
	},

	mapIdsToUserNames : function(userNamesById, onUsersMapped) {
		return function(users) {
			users.find({}, {
				fields : {
					_id : 1,
					userName : 1
				}
			}).toArray(function(err, usersFound) {
				if (!usersFound) {
					throw new Error("no user found");
				}
				for (var i = 0; i < usersFound.length; i++) {
					userNamesById[usersFound[i]._id] = usersFound[i].userName;
				}
				onUsersMapped(usersFound);
			});
		};
	},
};
