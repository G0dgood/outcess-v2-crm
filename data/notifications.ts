import { Notification } from '../components/ui/NotificationDropdown';

export const sampleNotifications: Notification[] = [
	{
		id: '1',
		type: 'follow',
		user: { name: 'Anees Adeyinka', avatar: '/img/login_img.jpg', icon: 'user-add' },
		message: 'followed you',
		timestamp: '2m',
		isRead: false
	},
	{
		id: '2',
		type: 'like',
		user: { name: 'Anees Adeyinka', icon: 'thumbs-up-green' },
		message: 'liked your book "She was in the dark"',
		timestamp: '2m',
		isRead: false
	},
	{
		id: '3',
		type: 'join_request',
		user: { name: 'John Adelaja', icon: 'waypoints' },
		message: 'requested to join your group "The book geeks"',
		timestamp: '5m',
		isRead: true
	},
	{
		id: '4',
		type: 'group_activity',
		user: { name: 'Isreal tomiloba', icon: 'thumbs-up-green' },
		message: '& 4 others liked your post in the "book geeks"',
		timestamp: '10m',
		isRead: true
	},
	{
		id: '5',
		type: 'follow',
		user: { name: 'Olawale Adejuwon' , avatar: '/img/user5.png'},
		message: ', Brin Jackson & 2 others followed you',
		timestamp: '1h',
		isRead: true
	},
	{
		id: '6',
		type: 'comment',
		user: { name: 'Anees Adeyinka', icon: 'message-square-text' },
		message: 'replied to your comment on Mary Tenson\'s post in "lovely writer": True talk',
		timestamp: '1d',
		isRead: true
	},
	{
		id: '7',
		type: 'welcome',
		user: { name: 'Readlens', icon: 'telescope' },
		message: 'Welcome to Readlens, feast upon knowlegde and entertainment here',
		timestamp: '25/06/2022',
		isRead: true
	}
];
