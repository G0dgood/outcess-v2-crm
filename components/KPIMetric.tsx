'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';
import ColorPicker from '@/components/ui/ColorPicker';
import EmptyState from '@/components/ui/EmptyState';
import DeleteRecordModal from '@/components/ui/DeleteRecordModal';
import { MixIcon, Pencil1Icon, TrashIcon } from '@radix-ui/react-icons';
import { useSetup } from '@/contexts/SetupContext';
import SelectBucketModal from '@/components/ui/SelectBucketModal';

interface Widget {
    id: string;
    title: string;
    value: number;
    color: string;
    callOutcome?: string;
    bucketId?: string;
}

interface CallOutcome {
    id: string;
    name: string;
}

interface KPIMetricProps {
    widgets: Widget[];
    onWidgetsChange: (widgets: Widget[]) => void;
    callOutcomes: CallOutcome[];
    onCallOutcomesChange: (callOutcomes: CallOutcome[]) => void;
}

interface WidgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSave: () => void;
    widgetForm: {
        title: string;
        callOutcome: string;
        color: string;
    };
    setWidgetForm: React.Dispatch<React.SetStateAction<{
        title: string;
        callOutcome: string;
        color: string;
    }>>;
    callOutcomes: CallOutcome[];
    onAddOutcomeClick: () => void;
}

interface OutcomesModalProps {
    isOpen: boolean;
    onClose: () => void;
    newOutcome: string;
    setNewOutcome: React.Dispatch<React.SetStateAction<string>>;
    callOutcomes: CallOutcome[];
    onAddOutcome: () => void;
    onUpdateOutcome: (id: string, name: string) => void;
    onDeleteOutcome: (id: string) => void;
}

// 🟢 1. Main Component declared first so handlers are ready
export default function KPIMetric({
    widgets,
    onWidgetsChange,
    callOutcomes,
    onCallOutcomesChange
}: KPIMetricProps) {
    const { setupData } = useSetup();
    const buckets = useMemo(
        () => setupData.dashboardSettings.buckets || [],
        [setupData.dashboardSettings.buckets]
    );
    const [selectedBucketId, setSelectedBucketId] = useState<string | null>(null);
    const [isBucketModalOpen, setIsBucketModalOpen] = useState(false);

    useEffect(() => {
        if (buckets.length === 1 && !selectedBucketId) {
            setSelectedBucketId(buckets[0].id);
        }
    }, [buckets, selectedBucketId]);

    const activeBucket = useMemo(() => {
        return buckets.find(b => b.id === selectedBucketId);
    }, [buckets, selectedBucketId]);

    const displayedWidgets = useMemo(() => {
        if (buckets.length > 1 && selectedBucketId) {
            return widgets.filter(w => w.bucketId === selectedBucketId);
        }
        return widgets;
    }, [widgets, buckets.length, selectedBucketId]);

    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
    const [isEditWidgetModalOpen, setIsEditWidgetModalOpen] = useState(false);
    const [isOutcomesModalOpen, setIsOutcomesModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
    const [deletingWidget, setDeletingWidget] = useState<Widget | null>(null);
    const [newOutcome, setNewOutcome] = useState('');
    const [widgetForm, setWidgetForm] = useState({
        title: '',
        callOutcome: '',
        color: '#6C8B7D'
    });

    const handleAddWidget = () => {
        setIsWidgetModalOpen(true);
        setWidgetForm({ title: '', callOutcome: '', color: '#6C8B7D' });
    };

    const handleEditWidget = (widget: Widget) => {
        setEditingWidget(widget);
        setWidgetForm({
            title: widget.title,
            callOutcome: widget.callOutcome || '',
            color: widget.color
        });
        setIsEditWidgetModalOpen(true);
    };

    const handleDeleteWidgetClick = (widget: Widget) => {
        setDeletingWidget(widget);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDeleteWidget = () => {
        if (deletingWidget) {
            const updatedWidgets = widgets.filter(w => w.id !== deletingWidget.id);
            onWidgetsChange(updatedWidgets);
        }
        setIsDeleteModalOpen(false);
        setDeletingWidget(null);
    };

    const handleSaveWidget = () => {
        if (editingWidget) {
            const updatedWidgets = widgets.map(w =>
                w.id === editingWidget.id
                    ? { ...w, title: widgetForm.title, callOutcome: widgetForm.callOutcome, color: widgetForm.color }
                    : w
            );
            onWidgetsChange(updatedWidgets);
            setIsEditWidgetModalOpen(false);
        } else {
            const newWidget: Widget = {
                id: Date.now().toString(),
                title: widgetForm.title,
                value: 0,
                color: widgetForm.color,
                callOutcome: widgetForm.callOutcome,
                ...(selectedBucketId ? { bucketId: selectedBucketId } : {})
            };
            onWidgetsChange([...widgets, newWidget]);
            setIsWidgetModalOpen(false);
        }
        setEditingWidget(null);
        setWidgetForm({ title: '', callOutcome: '', color: '#6C8B7D' });
    };

    const handleAddOutcome = () => {
        if (newOutcome.trim()) {
            const newCallOutcome: CallOutcome = {
                id: Date.now().toString(),
                name: newOutcome.trim()
            };
            onCallOutcomesChange([...callOutcomes, newCallOutcome]);
            setNewOutcome('');
        }
    };

    const handleDeleteOutcome = (id: string) => {
        const updatedOutcomes = callOutcomes.filter(o => o.id !== id);
        onCallOutcomesChange(updatedOutcomes);
    };

    const handleUpdateOutcome = (id: string, name: string) => {
        const updatedOutcomes = callOutcomes.map(o =>
            o.id === id ? { ...o, name } : o
        );
        onCallOutcomesChange(updatedOutcomes);
    };

    return (
        <div className="space-y-6">
            {buckets.length > 1 && !selectedBucketId ? (
                <div
                    className="flex flex-col items-center justify-center min-h-[350px] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/10 cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-900/20 group p-10"
                    onClick={() => setIsBucketModalOpen(true)}
                >
                    <div
                        className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform"
                    >
                        <MixIcon className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold dark:text-white mb-2" style={{ color: 'var(--text-primary)' }}>
                        Select a Bucket
                    </h3>
                    <p className="text-sm dark:text-gray-400 max-w-sm text-center mb-6" style={{ color: 'var(--text-tertiary)' }}>
                        Choose the bucket you want to add and configure your KPI metrics for.
                    </p>
                    <Button
                        variant="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsBucketModalOpen(true);
                        }}
                    >
                        Select Bucket
                    </Button>
                </div>
            ) : (
                <>
                    {/* Active Bucket Header */}
                    {buckets.length > 1 && selectedBucketId && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                    style={{ backgroundColor: activeBucket?.color || 'var(--text-primary)' }}
                                >
                                    <MixIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold dark:text-white" style={{ color: 'var(--text-primary)' }}>
                                        Active Bucket: {activeBucket?.name}
                                    </h4>
                                    <p className="text-[10px] text-gray-500">
                                        Configuring KPI metrics for this segment
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsBucketModalOpen(true)}
                            >
                                Change Bucket
                            </Button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => setIsOutcomesModalOpen(true)}
                        >
                            Manage Outcomes
                        </Button>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleAddWidget}
                        >
                            Add Widget
                        </Button>
                    </div>

                    {/* Widgets Grid */}
                    {displayedWidgets.length === 0 ? (
                        <EmptyState
                            icon={MixIcon}
                            title="No KPI Metrics Yet"
                            description="Add your first KPI metric widget above to get started"
                            className="py-16"
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {displayedWidgets.map((widget) => (
                                <div
                                    key={widget.id}
                                    className="dark:bg-gray-800 border dark:border-gray-700 p-6 relative rounded-[var(--radius)] overflow-hidden"
                                    style={{
                                        backgroundColor: 'var(--accent-white)',
                                        borderColor: 'var(--light-gray)'
                                    }}
                                >
                                    {/* Widget Color Accent */}
                                    <div
                                        className="absolute top-0 left-0 w-full h-1"
                                        style={{ backgroundColor: widget.color }}
                                    />
                                    <div className="flex items-center justify-between mb-4">
                                        <h3
                                            className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100"
                                            style={{ color: 'var(--text-primary)' }}
                                        >
                                            {widget.title}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditWidget(widget)}
                                                className="p-1 h-auto"
                                                style={{ color: 'var(--text-tertiary)' }}
                                                title="Edit Metric"
                                            >
                                                <Pencil1Icon className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteWidgetClick(widget)}
                                                className="p-1 h-auto text-red-500 hover:text-red-700"
                                                title="Delete KPI Metric"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div
                                        className="text-3xl font-bold"
                                        style={{ color: widget.color }}
                                    >
                                        {widget.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <WidgetModal
                isOpen={isWidgetModalOpen}
                onClose={() => setIsWidgetModalOpen(false)}
                title="Widget"
                onSave={handleSaveWidget}
                widgetForm={widgetForm}
                setWidgetForm={setWidgetForm}
                callOutcomes={callOutcomes}
                onAddOutcomeClick={() => setIsOutcomesModalOpen(true)}
            />
            <WidgetModal
                isOpen={isEditWidgetModalOpen}
                onClose={() => setIsEditWidgetModalOpen(false)}
                title="Edit"
                onSave={handleSaveWidget}
                widgetForm={widgetForm}
                setWidgetForm={setWidgetForm}
                callOutcomes={callOutcomes}
                onAddOutcomeClick={() => setIsOutcomesModalOpen(true)}
            />
            <OutcomesModal
                isOpen={isOutcomesModalOpen}
                onClose={() => setIsOutcomesModalOpen(false)}
                newOutcome={newOutcome}
                setNewOutcome={setNewOutcome}
                callOutcomes={callOutcomes}
                onAddOutcome={handleAddOutcome}
                onUpdateOutcome={handleUpdateOutcome}
                onDeleteOutcome={handleDeleteOutcome}
            />
            <DeleteRecordModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setDeletingWidget(null); }}
                onConfirm={handleConfirmDeleteWidget}
                recordName={deletingWidget?.title || ''}
            />
            <SelectBucketModal
                isOpen={isBucketModalOpen}
                onClose={() => setIsBucketModalOpen(false)}
                buckets={buckets}
                selectedBucketId={selectedBucketId}
                onSelect={(bucketId) => {
                    setSelectedBucketId(bucketId);
                    setIsBucketModalOpen(false);
                }}
                onNavigateToDashboard={() => setIsBucketModalOpen(false)}
                getFieldCount={(bucketId) => widgets.filter(w => w.bucketId === bucketId).length}
            />
        </div>
    );
}

// 🔵 2. Modal Components moved safely down here below the runtime declarations
const WidgetModal: React.FC<WidgetModalProps> = ({
    isOpen,
    onClose,
    title,
    onSave,
    widgetForm,
    setWidgetForm,
    callOutcomes,
    onAddOutcomeClick
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="dark:bg-gray-800 w-full max-w-md mx-4 rounded-[var(--radius)]"
                style={{ backgroundColor: 'var(--accent-white)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex justify-between items-center p-6 border-b dark:border-gray-700"
                    style={{ borderColor: 'var(--light-gray)' }}
                >
                    <h2
                        className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {title}
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1 h-auto"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                        title="Close"
                    >
                        <Icon name="Close_round_light" size="lg" />
                    </Button>
                </div>
                <div className="p-6 space-y-4">
                    <Input
                        label="Title"
                        placeholder="Enter KPI Title (e.g., Total Calls Made)"
                        value={widgetForm.title}
                        onChange={(value) => setWidgetForm(prev => ({ ...prev, title: value }))}
                        type="text"
                    />
                    <Dropdown
                        label="Call Outcomes"
                        onActionClick={onAddOutcomeClick}
                        placeholder="Select call outcome"
                        value={widgetForm.callOutcome}
                        onChange={(value) => setWidgetForm(prev => ({ ...prev, callOutcome: Array.isArray(value) ? value[0] : value }))}
                        options={callOutcomes.map(outcome => ({ value: outcome.id, label: outcome.name }))}
                    />
                    <ColorPicker
                        label="Colour"
                        value={widgetForm.color}
                        onChange={(color: string) => setWidgetForm(prev => ({ ...prev, color }))}
                    />
                </div>
                <div
                    className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
                    style={{ borderColor: 'var(--light-gray)' }}
                >
                    <Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
                    <Button variant="primary" size="md" onClick={onSave}>Save</Button>
                </div>
            </div>
        </div>
    );
};

const OutcomesModal: React.FC<OutcomesModalProps> = ({
    isOpen,
    onClose,
    newOutcome,
    setNewOutcome,
    callOutcomes,
    onAddOutcome,
    onUpdateOutcome,
    onDeleteOutcome
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleEditClick = (outcome: CallOutcome) => {
        setEditingId(outcome.id);
        setNewOutcome(outcome.name);
    };

    const handleUpdateClick = () => {
        if (editingId && newOutcome.trim()) {
            onUpdateOutcome(editingId, newOutcome.trim());
            setEditingId(null);
            setNewOutcome('');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setNewOutcome('');
    };

    return (
        <div
            className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className="dark:bg-gray-800 w-full max-w-md mx-4 rounded-[var(--radius)]"
                style={{ backgroundColor: 'var(--accent-white)' }}
                onClick={(e) => e.stopPropagation()}
            >
                <div
                    className="flex justify-between items-center p-6 border-b dark:border-gray-700"
                    style={{ borderColor: 'var(--light-gray)' }}
                >
                    <h2
                        className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        Call Outcomes
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1 h-auto"
                        style={{ color: 'var(--text-tertiary)' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                        }}
                        title="Close"
                    >
                        <Icon name="Close_round_light" size="lg" />
                    </Button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex gap-2">
                        <Input
                            label=""
                            placeholder={editingId ? "Update Outcome" : "Add New Outcome"}
                            value={newOutcome}
                            onChange={setNewOutcome}
                            className="h-12.5"
                        />
                        {editingId ? (
                            <>
                                <Button className='' variant="primary" size="md" onClick={handleUpdateClick}>Update</Button>
                                <Button className='' variant="outline" size="md" onClick={handleCancelEdit}>Cancel</Button>
                            </>
                        ) : (
                            <Button className='' variant="primary" size="md" onClick={onAddOutcome}>Add</Button>
                        )}
                    </div>

                    {/* Empty State */}
                    {callOutcomes.length === 0 ? (
                        <EmptyState
                            icon={MixIcon}
                            title="No Call Outcomes Yet"
                            description="Add your first call outcome above to get started"
                            className="py-10"
                        />
                    ) : (
                        <div className="space-y-2">
                            {callOutcomes.map((outcome) => (
                                <div key={outcome.id} className="flex items-center justify-between">
                                    <span
                                        className="font-lato text-[10px] md:text-[12px] dark:text-gray-100"
                                        style={{ color: 'var(--text-primary)' }}
                                    >
                                        {outcome.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditClick(outcome)}
                                            className="p-1 h-auto"
                                            style={{ color: 'var(--text-tertiary)' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = 'var(--text-tertiary)';
                                            }}
                                            title="Edit Outcome"
                                        >
                                            <Icon name="Edit_duotone_line" size="sm" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDeleteOutcome(outcome.id)}
                                            className="p-1 h-auto"
                                            style={{ color: 'var(--text-tertiary)' }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.color = '#DC2626';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.color = 'var(--text-tertiary)';
                                            }}
                                            title="Delete Outcome"
                                        >
                                            <Icon name="Trash_light" size="sm" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div
                    className="flex justify-end p-6 border-t dark:border-gray-700"
                    style={{ borderColor: 'var(--light-gray)' }}
                >
                    <Button variant="outline" size="md" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
};