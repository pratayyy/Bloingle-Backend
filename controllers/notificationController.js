const catchAsync = require('../utils/catchAsync');

const Notification = require('../models/notificationModel');

exports.getAllNotificationsCount = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { filter } = req.query;

  const findQuery = { notificationFor: user, user: { $ne: user } };

  if (filter !== 'all') findQuery.type = filter;

  const count = await Notification.countDocuments(findQuery);

  res.status(200).json({
    status: 'success',
    totalDocs: count,
  });
});

exports.getAllNotifications = catchAsync(async (req, res, next) => {
  const { user } = req;

  const { page, filter, deleteDocCount } = req.query;

  const maxLimit = 10;

  const findQuery = { notificationFor: user, user: { $ne: user } };

  let skipDocs = (page - 1) * maxLimit;

  if (filter !== 'all') findQuery.type = filter;

  if (deleteDocCount) skipDocs -= deleteDocCount;

  const notifications = await Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate('blog', 'title slug')
    .populate(
      'user',
      'personalInfo.name personalInfo.username personalInfo.photo',
    )
    .populate('comment', 'content')
    .populate('repliedOnComment', 'content')
    .populate('reply', 'content')
    .sort({ createdAt: -1 })
    .select('createdAt type seen reply');

  await Notification.updateMany(findQuery, { seen: true })
    .skip(skipDocs)
    .limit(maxLimit);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    notifications,
  });
});

exports.getNewNotifications = catchAsync(async (req, res, next) => {
  const { user } = req;

  const result = await Notification.exists({
    notificationFor: user,
    seen: false,
    user: { $ne: user },
  });

  let newNotificationAvailable;

  if (result) {
    newNotificationAvailable = true;
  } else {
    newNotificationAvailable = false;
  }

  res.status(200).json({
    status: 'success',
    newNotificationAvailable,
  });
});
