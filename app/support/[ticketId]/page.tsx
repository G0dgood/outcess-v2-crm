'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import PageHeading from '@/components/ui/PageHeading';
import {
	useGetTicketByIdQuery,
	useAddMessageMutation,
	useUpdateTicketMutation,
	useEscalateTicketMutation,
	SupportTicket,
	PopulatedRole,
	TicketMessage
} from '@/store/services/supportApi';
import { useAuth } from '@/contexts/AuthContext';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useSocket } from '@/contexts/SocketContext';
import { Send, ChevronUp, CheckCircle, ArrowLeft, RefreshCw, XCircle, PanelRightOpen, X } from 'lucide-react';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import { TicketSidebar } from '@/components/features/support/TicketSidebar';
import SupportDetailsSkeleton from '@/components/skeletons/SupportDetailsSkeleton';
import { SupportStatusModal } from '@/components/features/support/SupportStatusModal';


export default function TicketDetailsPage({ params }: { params: Promise<{ ticketId: string }> }) {
	const router = useRouter();
	const { ticketId } = use(params);
	const { user } = useAuth();
	const { lineOfBusinessData } = useLineOfBusiness();
	const { socket, isConnected } = useSocket();
	const [newMessage, setNewMessage] = useState('');
	const [messages, setMessages] = useState<TicketMessage[]>([]);
	const [typingUsers, setTypingUsers] = useState<string[]>([]);
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
	const [statusModalType, setStatusModalType] = useState<'Resolve' | 'Close' | 'Reopen' | 'Done'>('Resolve');
	const scrollRef = useRef<HTMLDivElement>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isTypingRef = useRef(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const userRole = typeof user?.role === 'object' ? (user?.role as { roleName?: string })?.roleName : user?.role;
	const isSupervisorOrAdmin = userRole?.toLowerCase() === 'supervisor' || userRole?.toLowerCase() === 'admin';

	const { data: ticketData, isLoading, refetch } = useGetTicketByIdQuery(ticketId, {
		skip: !ticketId,
	});

	const [addMessage] = useAddMessageMutation();
	const [updateTicket] = useUpdateTicketMutation();
	const [escalateTicket] = useEscalateTicketMutation();

	const ticket = ticketData?.ticket;
	// Initialize messages
	useEffect(() => {
		if (ticketData?.messages && ticketData.messages.length > 0) {
			setMessages(ticketData.messages);
		}
	}, [ticketData?.messages]);

	// Handle socket connection and new messages
	useEffect(() => {
		// Initialize notification sound
		if (typeof window !== 'undefined') {
			audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
		}

		if (isConnected && socket && ticketId) {
			socket.emit('joinTicket', ticketId);

			const handleNewMessage = (message: TicketMessage) => {
				setMessages((prev) => {
					// Prevent duplicate messages if already in state
					if (prev.some(m => m._id === message._id)) return prev;
					return [...prev, message];
				});
			};

			const handleTypingIndicator = ({ name, isTyping, userId: senderUserId }: { name: string, isTyping: boolean, userId: string }) => {
				if (senderUserId === user?.id) return;

				setTypingUsers(prev => {
					if (isTyping) {
						if (prev.includes(name)) return prev;
						return [...prev, name];
					} else {
						return prev.filter(u => u !== name);
					}
				});
			};

			socket.on('newTicketMessage', handleNewMessage);
			socket.on('typing_indicator', handleTypingIndicator);

			return () => {
				socket.off('newTicketMessage', handleNewMessage);
				socket.off('typing_indicator', handleTypingIndicator);
			};
		}
	}, [socket, ticketId, user, isConnected]);

	// Scroll to bottom on new message
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!newMessage.trim()) return;

		try {
			await addMessage({
				id: ticketId,
				data: {
					senderId: user?.id || '',
					senderType: user?.isTeamMember ? 'TeamMember' : 'User',
					senderName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
					message: newMessage.trim(),
				},
			}).unwrap();
			setNewMessage('');

			// Stop typing immediately on send
			if (isTypingRef.current && socket) {
				socket.emit('typing_stop', {
					ticketId,
					userId: user?.id,
					name: user?.name || user?.firstName
				});
				isTypingRef.current = false;
			}
		} catch {
			toastError('Failed to send message');
		}
	};

	const handleStatusChange = async (status: string) => {
		try {
			await updateTicket({ id: ticketId, data: { status } }).unwrap();
			toastSuccess(`Ticket marked as ${status}`);
			setIsStatusModalOpen(false);
			refetch();
		} catch {
			toastError('Failed to update status');
		}
	};

	const handleEscalate = async (level: string) => {
		try {
			await escalateTicket({
				id: ticketId,
				data: { escalationLevel: level }
			}).unwrap();
			toastSuccess(`Ticket escalated to ${level}`);
			refetch();
		} catch {
			toastError('Failed to escalate ticket');
		}
	};

	const getSenderName = (msg: TicketMessage) => {
		const sender = msg.senderId;

		// Extract raw IDs as strings for reliable comparison
		const senderIdStr = typeof sender === 'object' ? (sender?._id || sender?.id)?.toString() : sender?.toString();
		const creatorIdStr = typeof ticket?.creatorId === 'object' ? (ticket?.creatorId?._id || (ticket?.creatorId as { id?: string })?.id)?.toString() : ticket?.creatorId?.toString();
		const userIdStr = user?.id?.toString();

		// 1. Check if it's the current user (Highest priority)
		const isMe = (userIdStr && (senderIdStr === userIdStr));

		// 2. Creator Fallback (Only for the first message)
		const isFirstMessage = messages[0]?._id === msg._id;
		const isLikelyMe = isFirstMessage && (!senderIdStr || senderIdStr === null) && userIdStr && creatorIdStr && userIdStr === creatorIdStr;

		if (isMe || isLikelyMe) return 'You';

		// 2. Use permanently captured senderName if available
		if (msg.senderName) return msg.senderName;

		// 3. Handle null/missing sender (population fail)
		// If population failed for both this message and the ticket creator, or if they match
		if (!sender || sender === null) {
			if (!creatorIdStr || creatorIdStr === null || creatorIdStr === senderIdStr) {
				return ticket?.creatorName || 'Support Team';
			}

			// If it's the first message (initial ticket description), it's definitely the creator
			if (messages[0]?._id === msg._id) return ticket?.creatorName || 'Support Team';

			return 'Support Team';
		}

		// 3. If it's a populated object, try to get name from it
		if (typeof sender === 'object') {
			if (sender.name) return sender.name;
			if (sender.firstName || sender.lastName) {
				const fullName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim();
				if (fullName) return fullName;
			}
		}

		// 4. Fallback to ticket's creatorName if IDs match
		if (senderIdStr && creatorIdStr && senderIdStr === creatorIdStr) {
			if (ticket?.creatorName) return ticket.creatorName;
		}

		return 'Support Team';
	};

	if (isLoading) {
		return <SupportDetailsSkeleton />;
	}

	if (!ticket) {
		return <div className="p-8 text-center text-gray-500">Ticket not found</div>;
	}

	return (
		<div className="p-0 flex flex-col" style={{ height: 'calc(95vh - 100px)' }}>
			{/* Header */}
			<div className="flex items-center justify-between gap-4 mb-6 shrink-0">
				<div className="flex items-center gap-4">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							if (window.history.length > 1) {
								router.back();
							} else {
								router.push('/support');
							}
						}}
						className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					>
						<ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					</Button>
					<PageHeading text={`Ticket #${ticket?.ticketId}`} />
				</div>

				<div className="flex items-center gap-2">
					{/* Mobile Info Toggle */}
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsMobileSidebarOpen(true)}
						className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
					>
						<PanelRightOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					</Button>

					<div className="hidden sm:flex items-center gap-3">
						{ticket?.status !== 'Completed' && ticket?.status !== 'Closed' && (
							<Button
								variant="outline"
								size="md"
								onClick={() => {
									setStatusModalType('Resolve');
									setIsStatusModalOpen(true);
								}}
								className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900/50 dark:hover:bg-green-900/20 shadow-sm"
							>
								<CheckCircle className="w-4 h-4 mr-2" />
								Resolve Ticket
							</Button>
						)}
						{ticket?.status !== 'Closed' && (
							<Button
								variant="outline"
								size="md"
								onClick={() => {
									setStatusModalType('Close');
									setIsStatusModalOpen(true);
								}}
								className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20 shadow-sm"
							>
								<XCircle className="w-4 h-4 mr-2" />
								Close Ticket
							</Button>
						)}
						{(ticket?.status === 'Completed' || ticket?.status === 'Closed') && (
							<Button
								variant="outline"
								size="md"
								onClick={() => {
									setStatusModalType('Reopen');
									setIsStatusModalOpen(true);
								}}
								className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-green-900/20 shadow-sm"
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Reopen Ticket
							</Button>
						)}
						{ticket?.status !== 'Completed' && ticket?.status !== 'Closed' && isSupervisorOrAdmin && (
							<Button
								variant="primary"
								size="md"
								onClick={() => {
									setStatusModalType('Done');
									setIsStatusModalOpen(true);
								}}
								className="text-white shadow-sm"
								style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
							>
								<CheckCircle className="w-4 h-4 mr-2" />
								Mark as Completed
							</Button>
						)}
						{(user?.role === 'supervisor' || user?.role === 'admin') &&
							ticket?.status !== 'Closed' &&
							(typeof ticket?.escalationLevel === 'object' ? (ticket?.escalationLevel as PopulatedRole)?.roleName : ticket?.escalationLevel) !== 'SuperAdmin' && (
								<Button
									variant="outline"
									size="md"
									onClick={() => {
										const currentLevel = typeof ticket?.escalationLevel === 'object' ? (ticket?.escalationLevel as PopulatedRole)?.roleName : ticket?.escalationLevel;
										handleEscalate(currentLevel === 'Supervisor' ? 'Admin' : 'SuperAdmin');
									}}
									className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-900/50 dark:hover:bg-purple-900/20 shadow-sm"
								>
									<ChevronUp className="w-4 h-4 mr-2" />
									Escalate
								</Button>
							)}
					</div>

					{/* Mobile Status Actions (Icon only to save space) */}
					<div className="flex sm:hidden items-center gap-1">
						{(ticket?.status === 'Completed' || ticket?.status === 'Closed') && (
							<button
								onClick={() => { setStatusModalType('Reopen'); setIsStatusModalOpen(true); }}
								className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-full"
							>
								<RefreshCw className="w-5 h-5" />
							</button>
						)}
						{ticket?.status !== 'Completed' && ticket?.status !== 'Closed' && (
							<button
								onClick={() => { setStatusModalType('Done'); setIsStatusModalOpen(true); }}
								className="p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 rounded-full"
							>
								<CheckCircle className="w-5 h-5" />
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Main Two-Column Content Area */}
			<div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

				{/* Left Column: Real-time Chat Area */}
				<div className="flex flex-col flex-1 border dark:border-gray-700 overflow-hidden shadow-md rounded-[var(--radius)]" style={{ backgroundColor: 'var(--accent-white)' }}>
					{/* Header for Chat */}
					<div className="p-4 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
						<h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{ticket?.title}</h3>
					</div>

					{/* Chat Messages */}
					<div
						ref={scrollRef}
						className="flex-1 overflow-y-auto p-5 space-y-5 transition-colors relative"
						style={{ backgroundColor: 'var(--bg-primary)' }}
					>
						{messages?.length === 0 ? (
							<div className="flex items-center justify-center h-full text-sm text-gray-400 italic">No messages yet. Add the first response!</div>
						) : (
							messages?.map((msg, idx) => {
								const senderIdStr = typeof msg.senderId === 'object' ? (msg.senderId?._id || msg.senderId?.id)?.toString() : msg.senderId?.toString();
								const creatorIdStr = typeof ticket?.creatorId === 'object' ? (ticket?.creatorId?._id || (ticket?.creatorId as { id?: string })?.id)?.toString() : ticket?.creatorId?.toString();
								const userIdStr = user?.id?.toString();

								const isMe = (userIdStr && senderIdStr === userIdStr);
								const isFirstMessage = idx === 0;
								const isLikelyMe = isFirstMessage && (!senderIdStr || senderIdStr === null) && userIdStr && creatorIdStr && userIdStr === creatorIdStr;

								const isOwn = isMe || isLikelyMe;
								return (
									<div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
										<div className={`max-w-[85%] lg:max-w-[70%] flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
											<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden mt-1 px-0 flex items-center justify-center shadow-sm">
												{typeof msg.senderId === 'object' && msg.senderId?.avatar ? (
													<Image
														src={msg.senderId.avatar}
														className="w-full h-full object-cover"
														alt={getSenderName(msg)}
														width={32}
														height={32}
													/>
												) : (
													<div
														className="w-full h-full flex items-center justify-center text-[10px] font-bold transition-colors"
														style={{
															backgroundColor: (lineOfBusinessData?.primaryColor || 'var(--primary)') + '1A',
															color: lineOfBusinessData?.primaryColor || 'var(--primary)'
														}}
													>
														{(() => {
															// Derives initials from getSenderName result for consistency
															const fullName = getSenderName(msg);

															// If it's Me, use my current known initials
															if (fullName === 'You') {
																const initials = (user?.name || user?.firstName || 'Y') as string;
																return initials[0].toUpperCase();
															}

															// Otherwise use the derived name's first char
															return (fullName?.[0] || '?').toUpperCase();
														})()}
													</div>
												)}
											</div>
											<div className={`space-y-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
												<div className="flex items-center gap-2 px-1">
													<span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
														{getSenderName(msg)}
													</span>
													<span className="text-[10px] text-gray-400 dark:text-gray-500">
														{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
													</span>
												</div>
												<div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed transition-all shadow-sm ${isOwn
													? 'text-white dark:text-black rounded-tr-none'
													: 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none'
													}`}
													style={isOwn ? { backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' } : {}}
												>
													{msg.message}
												</div>
											</div>
										</div>
									</div>
								);
							})
						)}

						{/* Typing Indicator */}
						{typingUsers.length > 0 && (
							<div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
								<div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-none p-3 shadow-sm border dark:border-gray-700">
									<div className="flex items-center gap-2">
										<div className="flex gap-1">
											<span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
											<span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
											<span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
										</div>
										<span className="text-[11px] text-gray-500 font-medium italic">
											{typingUsers.length === 1
												? `${typingUsers[0]} is typing...`
												: `${typingUsers.length} people are typing...`}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Input Area */}
					<div
						className="p-4 border-t dark:border-gray-700 transition-colors bg-white dark:bg-gray-800 shrink-0"
						style={{ backgroundColor: 'var(--accent-white)' }}
					>
						<form
							onSubmit={handleSendMessage}
							className="flex items-center gap-3"
						>
							<div className="flex-1">
								<Textarea
									label=""
									placeholder={ticket?.status === 'Closed' ? 'This ticket is closed and cannot be replied to.' : 'Type your response here...'}
									value={newMessage}
									onChange={(val) => {
										setNewMessage(val);

										const userName = user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';

										// Handle typing indicator
										if (socket && user && !isTypingRef.current && val.trim()) {
											isTypingRef.current = true;
											socket.emit('typing_start', {
												ticketId,
												userId: user.id,
												name: userName
											});
										}

										// Immediate stop if cleared
										if (isTypingRef.current && !val.trim() && socket) {
											socket.emit('typing_stop', {
												ticketId,
												userId: user?.id,
												name: userName
											});
											isTypingRef.current = false;
										}

										if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

										typingTimeoutRef.current = setTimeout(() => {
											if (isTypingRef.current && socket) {
												socket.emit('typing_stop', {
													ticketId,
													userId: user?.id,
													name: userName
												});
												isTypingRef.current = false;
											}
										}, 3000);
									}}
									disabled={ticket?.status === 'Closed'}
									className="!gap-0 transition-all"
									inputClassName={`!h-[50px] !py-3 resize-none shadow-none border-gray-200 dark:border-gray-700 focus:border-gray-300 transition-all rounded-[var(--radius)] ${ticket?.status === 'Closed' ? 'bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60' : ''}`}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey && ticket?.status !== 'Closed') {
											e.preventDefault();
											handleSendMessage();
										}
									}}
								/>
							</div>
							<Button
								type="submit"
								disabled={!newMessage.trim() || ticket?.status === 'Closed'}
								className="text-white h-[50px] px-8 shadow-md hover:shadow-lg transition-shadow"
								style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
							>
								<Send className="w-5 h-5" />
							</Button>
						</form>
					</div>
				</div>

				{/* Right Column: Ticket Context Sidebar */}
				{/* Backdrop for mobile */}
				{isMobileSidebarOpen && (
					<div
						className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden transition-opacity"
						onClick={() => setIsMobileSidebarOpen(false)}
					/>
				)}
				<div className={`
					fixed inset-y-0 right-0 w-[85%] sm:w-80 bg-white dark:bg-gray-900 z-[70] shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:flex lg:flex-col lg:gap-6 lg:bg-transparent dark:lg:bg-transparent
					${isMobileSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
				`}>
					<div className="flex lg:hidden items-center justify-between p-4 border-b dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
						<h3 className="font-bold text-sm uppercase tracking-widest text-gray-500">Ticket Info</h3>
						<button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
							<X className="w-5 h-5 text-gray-500" />
						</button>
					</div>
					<div className="flex-1 overflow-y-auto no-scrollbar p-1 lg:p-0">
						<TicketSidebar ticket={ticket as SupportTicket} lineOfBusinessData={lineOfBusinessData} />
					</div>
				</div>

			</div>

			<SupportStatusModal
				isOpen={isStatusModalOpen}
				onClose={() => setIsStatusModalOpen(false)}
				onConfirm={handleStatusChange}
				type={statusModalType}
			/>
		</div>
	);
}
