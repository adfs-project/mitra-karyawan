import React, { useState } from 'react';
// FIX: Replaced useData with useCore as it is the correct exported member from DataContext.
import { useCore } from '../../contexts/DataContext';
import { PersonalizationRule, PersonalizationCondition, ConditionField, ConditionOperator, ActionType, Role } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon, XMarkIcon, LockClosedIcon } from '@heroicons/react/24/solid';
// FIX: Import useMarketplace to get products data.
import { useMarketplace } from '../../contexts/MarketplaceContext';

const emptyRule: Omit<PersonalizationRule, 'id'> = {
    name: '',
    conditions: [{ field: 'profile.branch', operator: 'equals', value: '' }],
    action: { type: 'PIN_ITEM', payload: {} },
    isActive: true,
};

const RuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (rule: Omit<PersonalizationRule, 'id'> | PersonalizationRule) => void;
    initialRule: Omit<PersonalizationRule, 'id'> | PersonalizationRule | null;
}> = ({ isOpen, onClose, onSave, initialRule }) => {
    // FIX: Get products data from useMarketplace hook.
    const { articles, users } = useCore();
    const { products } = useMarketplace();
    const [rule, setRule] = useState(initialRule || emptyRule);

    React.useEffect(() => {
        setRule(initialRule || emptyRule);
    }, [initialRule, isOpen]);

    const handleConditionChange = (index: number, field: keyof PersonalizationCondition, value: any) => {
        const newConditions = [...rule.conditions];
        newConditions[index] = { ...newConditions[index], [field]: value };
        setRule(prev => ({ ...prev, conditions: newConditions }));
    };

    const addCondition = () => {
        setRule(prev => ({ ...prev, conditions: [...prev.conditions, { field: 'profile.branch', operator: 'equals', value: '' }] }));
    };
    
    const removeCondition = (index: number) => {
        if (rule.conditions.length > 1) {
            setRule(prev => ({ ...prev, conditions: prev.conditions.filter((_, i) => i !== index) }));
        }
    };

    const handleActionTypeChange = (type: ActionType) => {
        setRule(prev => ({ ...prev, action: { type, payload: {} } }));
    };

    const handleSave = () => {
        // Basic validation
        if (!rule.name.trim() || rule.conditions.some(c => c.value === '')) {
            alert("Please fill in Rule Name and all condition values.");
            return;
        }
        onSave(rule);
        onClose();
    };

    if (!isOpen) return null;

    const conditionFields: { value: ConditionField; label: string }[] = [
        { value: 'profile.branch', label: 'User Branch' },
        { value: 'role', label: 'User Role' },
        { value: 'transactionCount', label: 'Transaction Count' },
    ];
    const operators: { value: ConditionOperator; label: string }[] = [
        { value: 'equals', label: 'Equals' },
        { value: 'not_equals', label: 'Not Equals' },
        { value: 'greater_than', label: 'Greater Than' },
        { value: 'less_than', label: 'Less Than' },
    ];
    const allBranches = [...new Set(users.map(u => u.profile.branch).filter(Boolean))];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-2xl border border-border-color max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{initialRule && 'id' in initialRule ? 'Edit Rule' : 'Create New Rule'}</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Rule Name (e.g., 'Promo for Jakarta')" value={rule.name} onChange={e => setRule(p => ({...p, name: e.target.value}))} className="w-full p-2 bg-surface-light rounded border border-border-color" />

                    {/* Conditions */}
                    <div className="space-y-2 p-3 bg-surface-light rounded-lg border border-border-color">
                        <h3 className="font-bold text-lg">IF</h3>
                        {rule.conditions.map((cond, i) => (
                            <div key={i} className="flex items-center space-x-2">
                                <select value={cond.field} onChange={e => handleConditionChange(i, 'field', e.target.value)} className="p-2 bg-surface rounded border border-border-color">
                                    {conditionFields.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                                </select>
                                <select value={cond.operator} onChange={e => handleConditionChange(i, 'operator', e.target.value)} className="p-2 bg-surface rounded border border-border-color">
                                    {operators.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                {cond.field === 'role' ? (
                                    <select value={cond.value as string} onChange={e => handleConditionChange(i, 'value', e.target.value)} className="flex-grow p-2 bg-surface rounded border border-border-color">
                                        {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                ) : cond.field === 'profile.branch' ? (
                                    <select value={cond.value as string} onChange={e => handleConditionChange(i, 'value', e.target.value)} className="flex-grow p-2 bg-surface rounded border border-border-color">
                                        <option value="">-- Select Branch --</option>
                                        {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                ) : (
                                    <input type="number" value={cond.value as number} onChange={e => handleConditionChange(i, 'value', Number(e.target.value))} className="flex-grow p-2 bg-surface rounded border border-border-color" />
                                )}
                                <button onClick={() => removeCondition(i)} disabled={rule.conditions.length <= 1} className="p-2 text-red-500 disabled:opacity-50"><TrashIcon className="h-5 w-5"/></button>
                            </div>
                        ))}
                        <button onClick={addCondition} className="text-sm text-primary font-semibold">+ Add Condition</button>
                    </div>

                    {/* Action */}
                    <div className="space-y-2 p-3 bg-surface-light rounded-lg border border-border-color">
                        <h3 className="font-bold text-lg">THEN</h3>
                        <div className="flex items-center space-x-2">
                            <select value={rule.action.type} onChange={e => handleActionTypeChange(e.target.value as ActionType)} className="p-2 bg-surface rounded border border-border-color">
                                <option value="PIN_ITEM">Pin Item</option>
                                <option value="SHOW_ANNOUNCEMENT">Show Announcement</option>
                            </select>
                             {rule.action.type === 'PIN_ITEM' && (
                                <select value={rule.action.payload.itemId} onChange={e => setRule(p => ({...p, action: { ...p.action, payload: { itemId: e.target.value }}}))} className="flex-grow p-2 bg-surface rounded border border-border-color">
                                    <option value="">-- Select Item to Pin --</option>
                                    <optgroup label="Products">
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </optgroup>
                                    <optgroup label="Articles">
                                        {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                                    </optgroup>
                                </select>
                            )}
                             {rule.action.type === 'SHOW_ANNOUNCEMENT' && (
                                <input type="text" placeholder="Announcement message..." value={rule.action.payload.message} onChange={e => setRule(p => ({...p, action: { ...p.action, payload: { message: e.target.value }}}))} className="flex-grow p-2 bg-surface rounded border border-border-color" />
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 mt-4 border-t border-border-color">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Cancel</button>
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded">Save Rule</button>
                </div>
            </div>
        </div>
    );
};

const AdminPersonalizationEngine: React.FC = () => {
    const { personalizationRules, addPersonalizationRule, updatePersonalizationRule, deletePersonalizationRule } = useCore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<PersonalizationRule | null>(null);

    const handleOpenModal = (rule: PersonalizationRule | null = null) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleSaveRule = (rule: Omit<PersonalizationRule, 'id'> | PersonalizationRule) => {
        if ('id' in rule) {
            updatePersonalizationRule(rule);
        } else {
            addPersonalizationRule(rule);
        }
    };

    const handleDeleteRule = (id: string) => {
        deletePersonalizationRule(id);
    }
    
    const handleToggleActive = (rule: PersonalizationRule) => {
        updatePersonalizationRule({ ...rule, isActive: !rule.isActive });
    }

    const formatCondition = (cond: PersonalizationCondition) => `${cond.field.replace('profile.', '')} ${cond.operator.replace('_', ' ')} ${cond.value}`;
    const formatAction = (action: PersonalizationRule['action']) => {
        if (action.type === 'PIN_ITEM') return `Pin item with ID: ${action.payload.itemId}`;
        if (action.type === 'SHOW_ANNOUNCEMENT') return `Show announcement: "${action.payload.message}"`;
        return '';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary flex items-center"><SparklesIcon className="h-8 w-8 mr-2"/> Personalization Engine</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Create New Rule
                </button>
            </div>
            
             <p className="text-text-secondary max-w-3xl">Create rules to dynamically customize the user's home page based on their profile and behavior. Rules are evaluated in order, and the first matching rule's action will be applied.</p>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                {personalizationRules.length > 0 ? (
                    <div className="space-y-4">
                        {personalizationRules.map(rule => (
                            <div key={rule.id} className={`p-4 rounded-lg border ${rule.isActive ? 'border-border-color bg-surface-light' : 'border-dashed border-border-color bg-surface opacity-60'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-lg text-primary">{rule.name}</h3>
                                        <div className="text-xs text-text-secondary mt-2">
                                            <p><span className="font-bold">IF:</span> {rule.conditions.map(formatCondition).join(' AND ')}</p>
                                            <p><span className="font-bold">THEN:</span> {formatAction(rule.action)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked={rule.isActive} onChange={() => handleToggleActive(rule)} className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                        <button onClick={() => handleOpenModal(rule)} className="p-2 rounded hover:bg-border-color"><PencilIcon className="h-5 w-5 text-yellow-400"/></button>
                                        <span onClick={() => handleDeleteRule(rule.id)} className="p-2 rounded cursor-pointer" title="Penghapusan dinonaktifkan secara permanen oleh sistem.">
                                            <LockClosedIcon className="h-5 w-5 text-gray-500"/>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-text-primary">No Personalization Rules Yet</h2>
                        <p className="text-text-secondary mt-2">Click "Create New Rule" to start personalizing the user experience.</p>
                    </div>
                )}
            </div>

            <RuleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveRule} initialRule={editingRule} />
        </div>
    );
};

export default AdminPersonalizationEngine;