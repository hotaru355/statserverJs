module.exports = {

	open : function(db, onStatsOpen) {
		return function(payload) {
			db.collection('statistics', {
				strict : true
			}, function(err, stats) {
				if (err) {
					throw new Error(err);
				}
				onStatsOpen(stats, payload);
			});
		};
	},

	findByUserId : function(db, onStatsFound) {
		return function(stats, userFound) {
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
				onStatsFound(statsFound);
			});
		};
	},

	writeToRes : function(res, userName) {
		return function(statsFound) {
			res.json({
				userName : userName,
				stats : statsFound
			});
		};
	},

	persist : function(res, statsJson) {
		return function(stats, userFound) {
			var isArray = statsJson instanceof Array;
			if (userFound) {
				statsJson['userId'] = userFound._id;
			}
			stats.insert(statsJson, function(err, statInserted) {
				if (err) {
					throw new Error("couldnt write");
				} else {
					if (isArray) {
						res.json(statInserted);
					} else {
						res.json(statInserted[0]);
					}
				}
			});
		};
	},

	groupOnUserId : function(statName, onStatsGrouped) {
		return function(stats) {
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
				onStatsGrouped(statsGrouped);
			});
		};
	},

	writeLeaderboardToRes : function(res, userNamesById, statName) {
		return function(statsGrouped) {
			var leaders = [];
			for (var i = 0; i < statsGrouped.length; i++) {
				leaders.push({
					rank : i+1,
					userName : userNamesById[statsGrouped[i]._id],
					value : statsGrouped[i].total,
				});
			}
			res.json({
				statName : statName,
				leaders : leaders
			});
		};
	},

};