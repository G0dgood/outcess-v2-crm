'use client';

import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import {
	useGetTicketByIdQuery,
	useAddMessageMutation,
	useUpdateTicketMutation,
	useEscalateTicketMutation,
	PopulatedRole,
} from '@/store/services/supportApi';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaign } from '@/contexts/CampaignContext';
import { useSocket } from '@/contexts/SocketContext';
import { Send, ChevronUp, CheckCircle } from 'lucide-react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import Image from 'next/image';


interface TicketMessage {
	_id: string;
	ticketId: string;
	senderId: {
		_id: string;
		firstName?: string;
		lastName?: string;
		name?: string;
		avatar?: string;
	} | string;
	senderType: 'User' | 'TeamMember';
	message: string;
	attachments?: string[];
	createdAt: string;
}

interface TicketDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	ticketId: string;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ isOpen, onClose, ticketId }) => {
	const { user } = useAuth();
	const { campaignData } = useCampaign();
	const { socket } = useSocket();
	const [messages, setMessages] = useState<TicketMessage[]>([]);
	const [newMessage, setNewMessage] = useState('');
	const scrollRef = useRef<HTMLDivElement>(null);

	const { data: ticketData, isLoading, refetch } = useGetTicketByIdQuery(ticketId);

	const [addMessage, { isLoading: isSending }] = useAddMessageMutation();
	const [updateTicket] = useUpdateTicketMutation();
	const [escalateTicket] = useEscalateTicketMutation();

	const ticket = ticketData?.ticket;

	// Handle Escape key and body scroll
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.body.style.overflow = 'unset';
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	// Initialize messages and join room
	useEffect(() => {
		if (ticketData?.messages) {
			setMessages(ticketData.messages);
		}

		if (socket && ticketId) {
			socket.emit('join_ticket', ticketId);

			socket.on('new_message', (message: TicketMessage) => {
				if (message.ticketId === ticketId) {
					setMessages((prev) => [...prev, message]);
				}
			});

			return () => {
				socket.emit('leave_ticket', ticketId);
				socket.off('new_message');
			};
		}
	}, [ticketId, socket, ticketData?.messages]);

	// Scroll to bottom on new message
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSendMessage = async (e?: React.FormEvent) => {
		e?.preventDefault();
		if (!newMessage.trim() || isSending) return;

		try {
			await addMessage({
				id: ticketId,
				data: {
					senderId: user?.id || '',
					senderType: 'User',
					senderName: user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User',
					message: newMessage.trim(),
				},
			}).unwrap();
			setNewMessage('');
		} catch {
			toast.error('Failed to send message');
		}
	};

	const handleStatusChange = async (status: string) => {
		try {
			await updateTicket({ id: ticketId, data: { status } }).unwrap();
			toast.success(`Ticket marked as ${status}`);
			refetch();
		} catch {
			toast.error('Failed to update status');
		}
	};

	const handleEscalate = async (level: string) => {
		try {
			await escalateTicket({
				id: ticketId,
				data: { escalationLevel: level }
			}).unwrap();
			toast.success(`Ticket escalated to ${level}`);
			refetch();
		} catch {
			toast.error('Failed to escalate ticket');
		}
	};

	const getStatusColor = (status?: string) => {
		switch (status) {
			case 'Open': return 'bg-blue-500';
			case 'In Progress': return 'bg-amber-500';
			case 'Completed': return 'bg-green-500';
			case 'Closed': return 'bg-gray-500';
			case 'Pending': return 'bg-purple-500';
			default: return 'bg-gray-500';
		}
	};

	if (isLoading) return null;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
			<div
				className="dark:bg-gray-800 shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700 shrink-0"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Ticket Details - {ticket?.ticketId}
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close Modal"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</Button>
				</div>

				{/* Modal Content */}
				<div className="flex-1 overflow-hidden flex flex-col min-h-0">
					{/* Ticket Header Info */}
					<div
						className="p-4 border-b flex items-start justify-between transition-colors shrink-0"
						style={{ backgroundColor: 'var(--accent-white)' }}
					>
						<div className="space-y-1">
							<h2 className="text-lg font-bold transition-colors" style={{ color: 'var(--text-primary)' }}>{ticket?.title}</h2>
							<div className="flex items-center gap-3">
								<span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${getStatusColor(ticket?.status)}`}>
									{ticket?.status}
								</span>
								<span className="text-[10px] md:text-[12px] dark:text-gray-400" style={{ color: 'var(--text-tertiary)' }}>
									Escalation: <span className="font-semibold" style={{ color: campaignData?.primaryColor || 'var(--primary)' }}>
										{typeof ticket?.escalationLevel === 'object' ? (ticket?.escalationLevel as PopulatedRole)?.roleName || (ticket?.escalationLevel as PopulatedRole)?.name : ticket?.escalationLevel}
									</span>
								</span>
							</div>
						</div>
						<div className="flex items-center gap-2">
							{ticket?.status !== 'Completed' && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleStatusChange('Completed')}
									className="text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-900/50 dark:hover:bg-green-900/20"
								>
									<CheckCircle className="w-4 h-4 mr-1" />
									Complete
								</Button>
							)}
							{(user?.role === 'supervisor' || user?.role === 'admin') && (typeof ticket?.escalationLevel === 'object' ? (ticket?.escalationLevel as unknown as PopulatedRole)?.roleName : ticket?.escalationLevel) !== 'SuperAdmin' && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => {
										const currentLevel = typeof ticket?.escalationLevel === 'object' ? (ticket?.escalationLevel as PopulatedRole)?.roleName : ticket?.escalationLevel;
										handleEscalate(currentLevel === 'Supervisor' ? 'Admin' : 'SuperAdmin');
									}}
									className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-900/50 dark:hover:bg-purple-900/20"
								>
									<ChevronUp className="w-4 h-4 mr-1" />
									Escalate
								</Button>
							)}
						</div>
					</div>

					{/* Description */}
					<div
						className="p-4 border-b dark:border-gray-700 italic text-[10px] md:text-[12px] transition-colors shrink-0"
						style={{ backgroundColor: 'var(--accent-white)', color: 'var(--text-secondary)' }}
					>
						<strong>Description:</strong> {ticket?.description}
					</div>

					{/* Chat Area */}
					<div
						ref={scrollRef}
						className="flex-1 overflow-y-auto p-4 space-y-4 transition-colors"
						style={{ backgroundColor: 'var(--bg-primary)' }}
					>
						{messages.map((msg, idx) => {
							const isOwn = typeof msg.senderId === 'object' ? (msg.senderId?._id === user?.id) : (msg.senderId === user?.id);
							return (
								<div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
									<div className={`max-w-[80%] flex items-start gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
										<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden mt-1 relative">
											{typeof msg.senderId === 'object' && msg.senderId.avatar ? (
												<Image
													src={msg.senderId.avatar}
													alt="avatar"
													width={32}
													height={32}
													className="w-full h-full object-cover"
												/>
											) : (
												<div
													className="w-full h-full flex items-center justify-center text-[8px] md:text-[10px] font-bold transition-colors"
													style={{
														backgroundColor: (campaignData?.primaryColor || 'var(--primary)') + '1A',
														color: campaignData?.primaryColor || 'var(--primary)'
													}}
												>
													{typeof msg.senderId === 'object' ? (msg.senderId?.firstName?.[0] || msg.senderId?.name?.[0] || '?').toUpperCase() : '?'}
												</div>
											)}
										</div>
										<div className={`space-y-1 ${isOwn ? 'items-end' : 'items-start'}`}>
											<div className={`p-3 rounded-2xl text-[10px] md:text-[12px] transition-all ${isOwn
													? 'text-white rounded-tr-none'
													: 'bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-none shadow-sm'
												}`}
												style={isOwn ? { backgroundColor: campaignData?.primaryColor || 'var(--primary)' } : {}}
											>
												{msg.message}
											</div>
											<span className="text-[10px] text-gray-400 dark:text-gray-500 px-1">
												{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Input Area */}
					<div
						className="p-4 border-t transition-colors shrink-0"
						style={{ backgroundColor: 'var(--accent-white)' }}
					>
						<form
							onSubmit={handleSendMessage}
							className="flex items-end gap-3"
						>
							<div className="flex-1">
								<Textarea
									label=""
									placeholder="Type your message..."
									value={newMessage}
									onChange={(val) => setNewMessage(val)}
									className="min-h-[44px] max-h-[120px] py-2"
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											handleSendMessage();
										}
									}}
								/>
							</div>
							<Button
								type="submit"
								disabled={!newMessage.trim()}
								loading={isSending}
								className="text-white h-11 px-6"
								style={{ backgroundColor: campaignData?.primaryColor || 'var(--primary)' }}
							>
								<Send className="w-4 h-4" />
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TicketDetailsModal;
