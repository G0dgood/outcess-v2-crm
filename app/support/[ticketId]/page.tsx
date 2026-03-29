'use client';

import React, { useState, useEffect, useRef, use } from 'react';
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
import { Send, ChevronUp, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { TicketSidebar } from '@/components/features/support/TicketSidebar';
import SupportDetailsSkeleton from '@/components/skeletons/SupportDetailsSkeleton';
import { SupportStatusModal } from '@/components/features/support/SupportStatusModal';
import { RefreshCw, XCircle } from 'lucide-react';


export default function TicketDetailsPage({ params }: { params: Promise<{ ticketId: string }> }) {
	const router = useRouter();
	const { ticketId } = use(params);
	const { user } = useAuth();
	const { lineOfBusinessData } = useLineOfBusiness();
	const { socket } = useSocket();
	const [newMessage, setNewMessage] = useState('');
	const [messages, setMessages] = useState<TicketMessage[]>([]);
	const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
	const [statusModalType, setStatusModalType] = useState<'Resolve' | 'Close' | 'Reopen'>('Resolve');
	const scrollRef = useRef<HTMLDivElement>(null);

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
		if (socket && ticketId) {
			socket.emit('join', ticketId);

			const handleNewMessage = (message: TicketMessage) => {
				setMessages((prev) => [...prev, message]);
			};

			socket.on('newTicketMessage', handleNewMessage);

			return () => {
				socket.off('newTicketMessage', handleNewMessage);
			};
		}
	}, [socket, ticketId]);

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
					senderId: user?.id,
					senderType: 'User',
					message: newMessage.trim(),
				},
			}).unwrap();
			setNewMessage('');
		} catch (error) {
			toast.error('Failed to send message');
		}
	};

	const handleStatusChange = async (status: string) => {
		try {
			await updateTicket({ id: ticketId, data: { status } }).unwrap();
			toast.success(`Ticket marked as ${status}`);
			refetch();
		} catch (error) {
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
		} catch (error) {
			toast.error('Failed to escalate ticket');
		}
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
						onClick={() => router.push('/support')}
						className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors !rounded-none"
					>
						<ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
					</Button>
					<PageHeading text={`Ticket #${ticket?.ticketId}`} />
				</div>

				{/* Action Buttons in Header */}
				<div className="flex items-center gap-3">
					{ticket?.status !== 'Resolved' && ticket?.status !== 'Closed' && (
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
					{(ticket?.status === 'Resolved' || ticket?.status === 'Closed') && (
						<Button
							variant="outline"
							size="md"
							onClick={() => {
								setStatusModalType('Reopen');
								setIsStatusModalOpen(true);
							}}
							className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20 shadow-sm"
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Reopen Ticket
						</Button>
					)}
					{(user?.role === 'supervisor' || user?.role === 'admin') && (typeof ticket?.escalationLevel === 'object' ? (ticket?.escalationLevel as PopulatedRole)?.roleName : ticket?.escalationLevel) !== 'SuperAdmin' && (
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
			</div>

			{/* Main Two-Column Content Area */}
			<div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

				{/* Left Column: Real-time Chat Area */}
				<div className="flex flex-col flex-1 border dark:border-gray-700 overflow-hidden shadow-md" style={{ backgroundColor: 'var(--accent-white)' }}>
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
								const isOwn = msg.senderId?._id === user?.id || msg.senderId === user?.id;
								return (
									<div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
										<div className={`max-w-[85%] lg:max-w-[70%] flex items-start gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
											<div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0 overflow-hidden mt-1 px-0 flex items-center justify-center shadow-sm">
												{msg.senderId?.avatar ? (
													<img src={msg.senderId.avatar} className="w-full h-full object-cover" />
												) : (
													<div
														className="w-full h-full flex items-center justify-center text-[10px] font-bold transition-colors"
														style={{
															backgroundColor: (lineOfBusinessData?.primaryColor || 'var(--primary)') + '1A',
															color: lineOfBusinessData?.primaryColor || 'var(--primary)'
														}}
													>
														{(msg.senderId?.firstName?.[0] || msg.senderId?.name?.[0] || '?').toUpperCase()}
													</div>
												)}
											</div>
											<div className={`space-y-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
												<div className="flex items-center gap-2 px-1">
													<span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
														{isOwn ? 'You' : (msg.senderId?.firstName || msg.senderId?.name || 'Support Team')}
													</span>
													<span className="text-[10px] text-gray-400 dark:text-gray-500">
														{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
													</span>
												</div>
												<div className={`p-3.5 rounded-2xl text-[13px] leading-relaxed transition-all shadow-sm ${isOwn
													? 'text-white rounded-tr-none'
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
					</div>

					{/* Input Area */}
					<div
						className="p-4 border-t dark:border-gray-700 transition-colors bg-white dark:bg-gray-800 shrink-0"
						style={{ backgroundColor: 'var(--accent-white)' }}
					>
						<form
							onSubmit={handleSendMessage}
							className="flex items-end gap-3"
						>
							<div className="flex-1">
								<Textarea
									label=""
									placeholder="Type your response here..."
									value={newMessage}
									onChange={(val) => setNewMessage(val)}
									className="min-h-[30px] max-h-[70px] tracking-wide"
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
								className="text-white h-[50px] px-8 shadow-md hover:shadow-lg transition-shadow"
								style={{ backgroundColor: lineOfBusinessData?.primaryColor || 'var(--primary)' }}
							>
								<Send className="w-5 h-5" />
							</Button>
						</form>
					</div>
				</div>

				{/* Right Column: Ticket Context Sidebar */}
				<div className="w-full lg:w-80 shrink-0 flex flex-col gap-6 overflow-y-auto no-scrollbar min-h-0">
					<TicketSidebar ticket={ticket as SupportTicket} lineOfBusinessData={lineOfBusinessData} />
				</div>

			</div>

			<SupportStatusModal
				isOpen={isStatusModalOpen}
				onClose={() => setIsStatusModalOpen(false)}
				onConfirm={handleStatusChange}
				type={statusModalType}
				lineOfBusinessData={lineOfBusinessData}
			/>
		</div>
	);
}
