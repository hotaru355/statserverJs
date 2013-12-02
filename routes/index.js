var userDto = require('../dto/userDto.js');
var statsDto = require('../dto/statsDto.js');

exports.getStats = function(db) {
	return function(req, res) {
		var userName = req.param('userName');
		if (!userName) {
			throw new Error("'userName' query param required");
		}

		userDto.open(db,
				userDto.findByUserName(db, userName, 
						statsDto.open(db,
								statsDto.findByUserId(db, 
										statsDto.writeToRes(res, userName)))))();
	};
};

exports.saveStats = function(db) {
	return function(req, res) {
		var userName = req.param('userName');
		var statsJson = req.body;
		if (!userName) {
			throw new Error("'userName' query param required");
		}

		userDto.open(db,
				userDto.findByUserName(db, userName,
						statsDto.open(db,
								statsDto.persist(res, statsJson))))();
	};
};

exports.getLeaderboard = function(db) {
	return function(req, res) {
		var statName = req.param('statName');
		var userNamesById = [];

		if (!statName) {
			throw new Error("'statName' query param required");
		}
		
		userDto.open(db,
				userDto.mapIdsToUserNames(userNamesById,
						statsDto.open(db,
								statsDto.groupOnUserId(statName,
										statsDto.writeLeaderboardToRes(res, userNamesById, statName)))))();
	};
};



