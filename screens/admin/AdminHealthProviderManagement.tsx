import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Doctor } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const DoctorFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
    onSave: (data: Doctor | Omit<Doctor, 'id' | 'availableSlots'>) => void;
}> = ({ isOpen, onClose, doctor, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        specialty: '',
        bio: '',
        imageUrl: '',
        consultationFee: 0,
    });

    useEffect(() => {
        if (doctor) {
            setFormData({
                name: doctor.name,
                specialty: doctor.specialty,
                bio: doctor.bio,
                imageUrl: doctor.imageUrl,
                consultationFee: doctor.consultationFee,
            });
        } else {
            setFormData({
                name: '',
                specialty: '',
                bio: '',
                imageUrl: `https://i.pravatar.cc/150?u=doc-${Date.now()}`,
                consultationFee: 50000,
            });
        }
    }, [doctor, isOpen]);
    
    const handleSaveClick = () => {
        if (doctor) {
            onSave({ ...doctor, ...formData });
        } else {
            onSave(formData);
        }
        onClose();
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} className="w-full p-2 bg-surface-light rounded" />
                {/* Add other fields here */}
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Cancel</button>
                    <button onClick={handleSaveClick} className="btn-primary px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

const AdminHealthProviderManagement: React.FC = () => {
    const { doctors, consultations, addDoctor, updateDoctor, deleteDoctor, isDeletionLocked } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    const handleOpenModal = (doctor: Doctor | null = null) => {
        setEditingDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleSave = (data: Doctor | Omit<Doctor, 'id' | 'availableSlots'>) => {
        if ('id' in data) {
            updateDoctor(data);
        } else {
            addDoctor(data);
        }
    };

    const handleDelete = (doctorId: string) => {
        if (window.confirm("Are you sure you want to delete this doctor?")) {
            deleteDoctor(doctorId);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Health Provider Management</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Provider
                </button>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><UserGroupIcon className="h-5 w-5 mr-2" /> Registered Doctors</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Specialty</th>
                                <th className="px-6 py-3">Fee</th>
                                <th className="px-6 py-3">Consultations</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(doc => (
                                <tr key={doc.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{doc.name}</td>
                                    <td className="px-6 py-4">{doc.specialty}</td>
                                    <td className="px-6 py-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(doc.consultationFee)}</td>
                                    <td className="px-6 py-4">{consultations.filter(c => c.doctorId === doc.id).length}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleOpenModal(doc)} className="p-2 rounded hover:bg-surface-light"><PencilIcon className="h-4 w-4 text-yellow-400"/></button>
                                        <button 
                                            onClick={() => handleDelete(doc.id)}
                                            disabled={isDeletionLocked} 
                                            title={isDeletionLocked ? "Deletion is locked in System Controls." : "Delete Doctor"} 
                                            className={`p-2 rounded ${isDeletionLocked ? 'cursor-not-allowed' : 'hover:bg-surface-light'}`}
                                        >
                                            {isDeletionLocked ? <LockClosedIcon className="h-4 w-4 text-gray-500"/> : <TrashIcon className="h-4 w-4 text-red-500"/>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <DoctorFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={editingDoctor}
                onSave={handleSave}
            />
        </div>
    );
};

export default AdminHealthProviderManagement;