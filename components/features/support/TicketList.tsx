import { Calendar, Flag, Trash } from 'lucide-react';
import moment from 'moment';
import { useDeleteTicketMutation, SupportTicket } from '@/store/services/supportApi';
import { toastSuccess, toastError, toastInfo } from '@/utils/toastWithSound';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import ParticipantAvatars from './ParticipantAvatars';
import { AddTicketMemberModal } from './AddTicketMemberModal';
import { DeleteTicketModal } from './DeleteTicketModal';
import { SupportStatusDropdown } from './SupportStatusDropdown';

import EmptyState from '@/components/ui/EmptyState';

interface TicketListProps {
	tickets: SupportTicket[];
	isLoading: boolean;
	campaignData: {
		primaryColor?: string;
		_id?: string;
	};
	onOpenTicket: (id: string) => void;
}

const TicketList: React.FC<TicketListProps> = ({
	tickets,
	isLoading,
	campaignData,
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

	const getStatusColors = (status: string) => {
		const normalized = status.toLowerCase();
		switch (normalized) {
			case 'open':
				return { border: 'border-blue-500', bg: 'bg-blue-500', badgeBg: 'bg-blue-600' };
			case 'pending':
				return { border: 'border-amber-500', bg: 'bg-amber-500', badgeBg: 'bg-amber-600' };
			case 'in progress':
				return { border: 'border-emerald-500', bg: 'bg-emerald-500', badgeBg: 'bg-emerald-600' };
			case 'completed':
				return { border: 'border-green-500', bg: 'bg-green-500', badgeBg: 'bg-green-600' };
			case 'in review':
				return { border: 'border-orange-500', bg: 'bg-orange-500', badgeBg: 'bg-orange-600' };
			case 'accepted':
				return { border: 'border-red-600', bg: 'bg-red-600', badgeBg: 'bg-red-700' };
			case 'rejected':
				return { border: 'border-purple-600', bg: 'bg-purple-600', badgeBg: 'bg-purple-700' };
			case 'closed':
				return { border: 'border-indigo-600', bg: 'bg-indigo-600', badgeBg: 'bg-indigo-700' };
			default:
				return { border: 'border-gray-400', bg: 'bg-gray-400', badgeBg: 'bg-gray-500' };
		}
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
			<EmptyState
				iconName="user"
				title="No Tickets Found"
				description="No active support tickets were found for the current selection. New tickets will appear here when they are created."
			/>
		);
	}

	return (
		<div className="flex flex-col border overflow-visible dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm rounded-[var(--radius)] overflow-hidden">
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
							<SupportStatusDropdown ticket={ticket} />

							{ticket.status === 'Open' && (
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
				ticket={assigningTicket as SupportTicket}
				campaignData={campaignData}
			/>
		</div>
	);
};

export default TicketList;
