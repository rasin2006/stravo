const User = require('./User');
const Activity = require('./Activity');
const ActivityPoint = require('./ActivityPoint');
const ActivitySegment = require('./ActivitySegment');
const SegmentFeedback = require('./SegmentFeedback');

User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });
Activity.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Activity.hasMany(ActivityPoint, { foreignKey: 'activityId', as: 'points' });
ActivityPoint.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });
Activity.hasMany(ActivitySegment, { foreignKey: 'activityId', as: 'activitySegments' });
ActivitySegment.belongsTo(Activity, { foreignKey: 'activityId', as: 'activity' });
ActivitySegment.hasMany(SegmentFeedback, { foreignKey: 'activitySegmentId', as: 'feedback' });
SegmentFeedback.belongsTo(ActivitySegment, { foreignKey: 'activitySegmentId', as: 'activitySegment' }); // Corrected alias
User.hasMany(SegmentFeedback, { foreignKey: 'userId', as: 'segmentFeedback' });
SegmentFeedback.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Activity,
  ActivityPoint,
  ActivitySegment,
  SegmentFeedback, // This model now refers to feedback on ActivitySegments
};
