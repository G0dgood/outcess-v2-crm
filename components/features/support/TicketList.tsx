import { User, Calendar, Flag, Trash, AlertTriangle } from 'lucide-react';
import moment from 'moment';
import { useDeleteTicketMutation, SupportTicket, PopulatedMember } from '@/store/services/supportApi';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

interface TicketListProps {
	tickets: SupportTicket[];
	isLoading: boolean;
	lineOfBusinessData?: {
		primaryColor?: string;
	};
	onOpenTicket: (id: string) => void;
}

const TicketList: React.FC<TicketListProps> = ({
	tickets,
	isLoading,
	onOpenTicket
}) => {
	useAuth(); // Removed unused 'user' assignment
	const [deleteTicket, { isLoading: isDeleting }] = useDeleteTicketMutation();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);

	const handleDeleteClick = (e: React.MouseEvent, ticket: SupportTicket) => {
		e.stopPropagation();
		setTicketToDelete(ticket);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!ticketToDelete) return;

		try {
			await deleteTicket(ticketToDelete._id).unwrap();
			toast.success('Ticket deleted successfully');
			setIsDeleteModalOpen(false);
			setTicketToDelete(null);
		} catch (err: unknown) {
			const error = err as { data?: { message?: string } };
			toast.error(error.data?.message || 'Failed to delete ticket');
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
		<div className="flex flex-col border overflow-hidden dark:border-gray-700 bg-white dark:bg-gray-900">
			{tickets.map((ticket) => {
				const colors = getStatusColors(ticket.status);
				return (
					<div
						key={ticket._id}
						onClick={() => onOpenTicket(ticket._id)}
						className="flex items-center justify-between p-4 border-b last:border-b-0 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-all cursor-pointer group"
					>
						{/* Left section: Status Icon + Title */}
						<div className="flex items-center gap-4 flex-1 min-w-0">
							<div className={`relative flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 ${colors.border}`}>
								<div className={`w-2 h-2 rounded-full ${colors.bg}`} />
							</div>
							<div className="flex flex-col min-w-0">
								<div className="flex items-center gap-2">
									<h3
										className="text-[14px] font-semibold text-gray-800 dark:text-gray-100 group-hover:text-[#F97316] dark:group-hover:text-[#F97316] transition-colors truncate"
									>
										{ticket.title}
									</h3>
									<span className="text-gray-300 dark:text-gray-700 font-light flex-shrink-0">
										—
									</span>
								</div>
								<p className="text-[11px] text-gray-400 dark:text-gray-500 truncate max-w-[200px] md:max-w-xs">
									{ticket.description || 'No description provided'}
								</p>
							</div>
						</div>

						{/* Middle section: Metadata MetadataIcons */}
						<div className="hidden md:flex items-center gap-10 lg:gap-16 flex-1 justify-center">
							<div className="flex items-center gap-1.5 group/icon" title={`Creator: ${typeof ticket.creatorId === 'object' ? (ticket.creatorId?.firstName || ticket.creatorId?.name || 'User') : 'User'}`}>
								<User className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover/icon:text-[#F97316] transition-colors" />
								<span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 group-hover/icon:text-[#F97316] transition-colors">
									{typeof ticket.creatorId === 'object'
										? (ticket.creatorId?.firstName ? `${ticket.creatorId.firstName} ${ticket.creatorId.lastName || ''}` : ticket.creatorId?.name || 'Unknown')
										: 'Unknown'}
								</span>
							</div>

							<div className="flex items-center gap-1.5 group/icon" title={`Created: ${new Date(ticket.createdAt).toLocaleDateString()}`}>
								<Calendar className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover/icon:text-[#F97316] transition-colors" />
								<span className="text-[11px] font-medium text-gray-400 dark:text-gray-500 group-hover/icon:text-[#F97316] transition-colors">
									{moment(ticket.createdAt).format('MMM DD, YYYY')}
								</span>
							</div>

							<div className="flex items-center gap-1.5 group/icon" title={`Priority: ${ticket.priority}`}>
								<Flag className={`w-4 h-4 transition-colors ${getPriorityColor(ticket.priority)}`} />
								<span className={`text-[11px] font-bold transition-colors uppercase tracking-wider ${getPriorityColor(ticket.priority)}`}>
									{ticket.priority}
								</span>
							</div>
						</div>

						{/* Right section: Status Badge & Actions */}
						<div className="flex items-center gap-4 ml-4 shrink-0">
							<div className={`flex items-center gap-3 px-3 py-1.5 min-w-[110px] justify-between shadow-sm ${colors.badgeBg}`}>
								<div className="w-5 h-5 rounded-full border-2 border-white/30 flex items-center justify-center">
									<div className="w-2 h-2 rounded-full bg-white shadow-sm" />
								</div>
								<span className="text-[10px] md:text-[11px] font-bold text-white tracking-widest whitespace-nowrap uppercase">
									{getDisplayStatus(ticket.status)}
								</span>
							</div>

							<button
								onClick={(e) => handleDeleteClick(e, ticket)}
								disabled={isDeleting}
								className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
								title="Delete Ticket"
							>
								<Trash className="w-4 h-4" />
							</button>
						</div>
					</div>
				);
			})}

			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title="Confirm Deletion"
				size="sm"
			>
				<div className="p-6">
					<div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full dark:bg-red-900/20">
						<AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" />
					</div>
					<div className="mt-4 text-center">
						<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							Delete Ticket?
						</h3>
						<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
							Are you sure you want to delete <span className="font-semibold">{ticketToDelete?.ticketId}</span>?
							This action cannot be undone and all messages will be lost.
						</p>
					</div>
					<div className="flex gap-3 mt-8">
						<Button
							variant="ghost"
							className="flex-1 dark:text-gray-400 dark:hover:bg-gray-800"
							onClick={() => setIsDeleteModalOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="danger"
							className="flex-1 bg-red-600 hover:bg-red-700 text-white"
							onClick={handleConfirmDelete}
							loading={isDeleting}
						>
							Delete
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

export default TicketList;
