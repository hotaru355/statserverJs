var stats = [ 'level', 'level', 'level', 'xp', 'xp', 'xp', 'kills', 'kills', 'points', 'points' ];
var date = new Date();

var cursor = db.users.find({}, {
	_id : 1
});

while (cursor.hasNext()) {
	var userId = cursor.next()._id;
	for (i = 0; i < 10; i++) {
		db.statistics.insert({
			userId : userId,
			statName : stats[i],
			value : Math.floor(Math.random() * 1000),
			createdAt : date.getTime(),
		});
	}
}
