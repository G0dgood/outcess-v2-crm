import { Calendar, Flag, Trash } from 'lucide-react';
import moment from 'moment';
import { useDeleteTicketMutation, SupportTicket } from '@/store/services/supportApi';
import { toastSuccess, toastError, toastInfo } from '@/utils/toastWithSound';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import ParticipantAvatars from './ParticipantAvatars';
import { AddTicketMemberModal } from './AddTicketMemberModal';
import { DeleteTicketModal } from './DeleteTicketModal';

interface TicketListProps {
	tickets: SupportTicket[];
	isLoading: boolean;
	lineOfBusinessData: {
		primaryColor?: string;
		_id?: string;
	};
	onOpenTicket: (id: string) => void;
}

const TicketList: React.FC<TicketListProps> = ({
	tickets,
	isLoading,
	lineOfBusinessData,
	onOpenTicket
}) => {
	useAuth(); // Removed unused 'user' assignment
	const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
	const [assigningTicket, setAssigningTicket] = useState<SupportTicket | null>(null);

	const handleDeleteClick = (e: React.MouseEvent, ticket: SupportTicket) => {
		e.stopPropagation();
		setTicketToDelete(ticket);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!ticketToDelete) return;

		try {
			await deleteTicket(ticketToDelete._id).unwrap();
			toastSuccess('Ticket deleted successfully');
			setIsDeleteModalOpen(false);
			setTicketToDelete(null);
		} catch (err: unknown) {
			const error = err as { data?: { message?: string } };
			toastError(error.data?.message || 'Failed to delete ticket');
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority?.toLowerCase()) {
			case 'high': return 'text-red-500 dark:text-red-400';
			case 'medium': return 'text-amber-500 dark:text-amber-400';
			case 'low': return 'text-green-500 dark:text-green-400';
			default: return 'text-gray-400 dark:text-gray-500';
		}
	};

	const getDisplayStatus = (status: string) => {
		return status.toUpperCase();
	};

	const getStatusColors = (status: string) => {
		const normalized = status.toLowerCase();
		if (normalized === 'resolved') {
			return { border: 'border-green-500', bg: 'bg-green-500', badgeBg: 'bg-green-600' };
		}
		if (normalized === 'new') {
			return { border: 'border-blue-500', bg: 'bg-blue-500', badgeBg: 'bg-blue-600' };
		}
		if (normalized === 'in progress') {
			return { border: 'border-yellow-500', bg: 'bg-yellow-500', badgeBg: 'bg-yellow-600' };
		}
		if (normalized === 'reopened') {
			return { border: 'border-purple-500', bg: 'bg-purple-500', badgeBg: 'bg-purple-600' };
		}
		if (normalized === 'closed') {
			return { border: 'border-indigo-500', bg: 'bg-indigo-500', badgeBg: 'bg-indigo-600' };
		}
		if (normalized === 'done') {
			return { border: 'border-emerald-600', bg: 'bg-emerald-600', badgeBg: 'bg-emerald-700' };
		}
		// Default to orange for other statuses
		return { border: 'border-[#F97316]', bg: 'bg-[#F97316]', badgeBg: 'bg-[#F97316]' };
	};

	if (isLoading) {
		return (
			<div className="flex flex-col gap-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="animate-pulse flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
						<div className="flex items-center gap-4 flex-1">
							<div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
							<div className="space-y-2">
								<div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
								<div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
							</div>
						</div>
						<div className="hidden md:flex gap-12 lg:gap-20">
							<div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
							<div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
							<div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
						</div>
						<div className="w-24 h-8 rounded-full bg-gray-200 dark:bg-gray-700 ml-4" />
					</div>
				))}
			</div>
		);
	}

	if (tickets.length === 0) {
		return (
			<div className="text-center py-16 border-2 border-dashed  dark:border-gray-700">
				<p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No active support tickets found.</p>
				<p className="text-sm text-gray-400 dark:text-gray-500 mt-1">New tickets will appear here when created.</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col border overflow-hidden dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
			{/* Grid Header */}
			<div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-700">
				<div className="col-span-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
					Ticket Info
				</div>
				<div className="col-span-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
					Participants
				</div>
				<div className="col-span-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
					Date
				</div>
				<div className="col-span-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">
					Priority
				</div>
				<div className="col-span-2 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">
					Status
				</div>
			</div>

			{tickets.map((ticket) => {
				const colors = getStatusColors(ticket.status);
				const requester = typeof ticket.creatorId === 'object' ? ticket.creatorId : null;
				const assignees = (ticket.assignedToIds || []).filter(a => typeof a === 'object');

				const handleCardClick = () => {
					if (!ticket.assignedToIds || ticket.assignedToIds.length === 0) {
						toastInfo('Please assign the ticket first');
						return;
					}
					onOpenTicket(ticket._id);
				};

				return (
					<div
						key={ticket._id}
						onClick={handleCardClick}
						className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 border-b last:border-b-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all cursor-pointer group"
					>
						{/* Info Section: col-span-4 */}
						<div className="col-span-1 md:col-span-4 flex items-start gap-4 min-w-0">
							<div className={`mt-1.5 relative flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${colors.border}`}>
								<div className={`w-2 h-2 rounded-full ${colors.bg}`} />
							</div>
							<div className="flex flex-col min-w-0">
								<div className="flex items-center gap-2 flex-wrap">
									<span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border dark:border-gray-700 shadow-sm">
										#{ticket?.ticketId || ticket?._id.slice(-6).toUpperCase()}
									</span>
									<h3 className="text-[14px] font-bold text-gray-800 dark:text-gray-100 group-hover:text-[#F97316] dark:group-hover:text-[#F97316] transition-colors truncate">
										{ticket?.title}
									</h3>
								</div>
								<p className="text-[11px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
									{ticket?.description || 'No description provided'}
								</p>
							</div>
						</div>

						{/* Participants Section: col-span-3 */}
						<div className="hidden md:flex items-center justify-center md:col-span-3">
							<ParticipantAvatars
								requester={requester}
								assignees={assignees}
								creatorName={ticket.creatorName}
								onAssign={() => setAssigningTicket(ticket)}
								status={ticket.status}
							/>
						</div>

						{/* Date Section: col-span-2 */}
						<div className="hidden md:flex flex-col items-center justify-center md:col-span-2 text-center">
							<div className="flex items-center gap-1.5">
								<Calendar className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-[#F97316] transition-colors shrink-0" />
								<span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
									{moment(ticket.createdAt).format('MMM DD, YYYY')}
								</span>
							</div>
						</div>

						{/* Priority Section: col-span-1 */}
						<div className="hidden md:flex justify-center md:col-span-1">
							<div className="flex items-center gap-1.5" title={`Priority: ${ticket.priority}`}>
								<Flag className={`w-3.5 h-3.5 transition-colors ${getPriorityColor(ticket.priority)}`} />
								<span className={`text-[10px] font-bold transition-colors uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
									{ticket.priority?.charAt(0)}
								</span>
							</div>
						</div>

						{/* Status & Actions Section: col-span-2 */}
						<div className="col-span-1 md:col-span-2 flex items-center justify-end gap-3 ml-auto">
							<div className={`flex items-center gap-2 px-2.5 py-1 min-w-[90px] justify-between shadow-sm  ${colors.badgeBg} bg-opacity-90`}>
								<div className="w-3 h-3 rounded-full border border-white/30 flex items-center justify-center">
									<div className="w-1 h-1 rounded-full bg-white" />
								</div>
								<span className="text-[9px] font-black text-white tracking-widest whitespace-nowrap uppercase">
									{getDisplayStatus(ticket.status)}
								</span>
							</div>

							{ticket.status === 'New' && (
								<button
									onClick={(e) => handleDeleteClick(e, ticket)}
									disabled={isDeleting}
									className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all"
									title="Delete Ticket"
								>
									<Trash className="w-3.5 h-3.5" />
								</button>
							)}
						</div>
					</div>
				);
			})}

			<DeleteTicketModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				onConfirm={handleConfirmDelete}
				ticketId={ticketToDelete?.ticketId || ''}
				isLoading={isDeleting}
			/>

			<AddTicketMemberModal
				isOpen={!!assigningTicket}
				onClose={() => setAssigningTicket(null)}
				ticket={assigningTicket as any}
				lineOfBusinessData={lineOfBusinessData}
			/>
		</div>
	);
};

export default TicketList;
