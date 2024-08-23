import Notification from '../model/notificationModel.js';
const BASE_URL = 'http://95.216.209.46:5500/uploads/';
export const createNotification = async (req, res) => {
  try {
    const { userId, agentId, propertyId } = req.body;

    const notification = new Notification({
      userId,
      agentId,
      propertyId
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

export const getAgentNotifications = async (req, res) => {
  try {
    const { agentId } = req.params;

    const notifications = await Notification.find({ agentId })
      .populate('userId', 'name email phone imageurl')
      .populate('propertyId', 'title type category bedrooms bathrooms squareFeet price location.address location.city')
      .sort('-createdAt');
      // Add BASE_URL to image paths if they are present
    notifications.forEach(notification => {
        if (notification.imageurl) {
          notification.imageurl = `${BASE_URL}${path.basename(notification.imageurl)}`;
        }
      });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
    try {
      const { notificationId } = req.params;
  
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { status: 'read' },
        { new: true }
      );
  
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error marking notification as read',
        error: error.message
      });
    }
  };
  
  export const getUnreadNotificationCount = async (req, res) => {
    try {
      const { agentId } = req.params;
  
      const count = await Notification.countDocuments({ agentId, status: 'unread' });
  
      res.status(200).json({
        success: true,
        count: count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error getting unread notification count',
        error: error.message
      });
    }
  };