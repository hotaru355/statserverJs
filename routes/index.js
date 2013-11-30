

exports.getStats = function(db) {
	return function(req, res) {
		var userName = req.param('userName');
		if (!userName) {
			throw new Error("query param required");
		}
		db.collection('users', {
			strict : true
		}, function(err, users) {
			if (err) {
				throw new Error(err);
			}

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
				db.collection('statistics', {
					strict : true
				}, function(err, stats) {
					if (err) {
						throw new Error(err);
					}
					stats.find({
						userId : userFound._id
					}, {
						fields : {
							userId : 0
						}
					}).toArray(function(err, statsFound) {
						if (!statsFound) {
							throw new Error("no stats found");
						}
						res.json({
							userName : userName,
							stats : statsFound
						});
					});
				});
			});

		});

	};
};

exports.saveStats = function(db) {
	return function(req, res) {
		var userName = req.param('userName');
		var statJson = req.body;

		if (!userName) {
			throw new Error("query param required");
		}
		db.collection('users', {
			strict : true
		}, function(err, users) {
			if (err) {
				throw new Error(err);
			}

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
				db.collection('statistics', {
					strict : true
				}, function(err, stats) {
					if (err) {
						throw new Error(err);
					}

					statJson['userId'] = userFound._id;
					stats.insert(statJson, function(err, statInserted) {
						if (err) {
							throw new Error("couldnt write");
						} else {
							res.json(statInserted);
						}
					});
				});
			});
		});
	};
};

exports.getLeaderboard = function(db) {
	return function(req, res) {
		var statName = req.param('statName');
		var userNameById = [];
		var records = [];

		if (!statName) {
			throw new Error("query param required");
		}

		db.collection('statistics', {
			strict : true
		}, function(err, stats) {
			if (err) {
				throw new Error(err);
			}

			db.collection('users', {
				strict : true
			}, function(err, users) {
				if (err) {
					throw new Error(err);
				}

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
						userNameById[usersFound[i]._id] = usersFound[i].userName;
					}
					stats.aggregate([ {
						$match : {
							statName : statName
						}
					}, {
						$group : {
							_id : "$userId",
							total : {
								$sum : "$value"
							}
						}
					}, {
						$sort : {
							total : -1
						}
					} ], function(err, statsGrouped) {
						if (err) {
							throw new Error(err);
						}
						for (var i = 0; i < statsGrouped.length; i++) {
							records.push({
								userName : userNameById[statsGrouped[i]._id],
								value : statsGrouped[i].total,
							});
						}
						res.json({
							statName : statName,
							leaders : records
						});
					});
				});
			});
		});
	};
};
