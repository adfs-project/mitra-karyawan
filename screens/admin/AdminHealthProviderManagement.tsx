import React, { useState } from 'react';
import { HeartIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/solid';
import { useData } from '../../contexts/DataContext';
import { Doctor } from '../../types';

const DoctorFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
    onSave: (data: Omit<Doctor, 'id' | 'availableSlots'> | Doctor) => void;
}> = ({ isOpen, onClose, doctor, onSave }) => {
    const [formData, setFormData] = useState({
        name: doctor?.name || '',
        specialty: doctor?.specialty || '',
        bio: doctor?.bio || '',
        consultationFee: doctor?.consultationFee || 0,
        imageUrl: doctor?.imageUrl || `https://i.pravatar.cc/150?u=doc-${Date.now()}`
    });

    React.useEffect(() => {
        if (doctor) {
            setFormData({
                name: doctor.name,
                specialty: doctor.specialty,
                bio: doctor.bio,
                consultationFee: doctor.consultationFee,
                imageUrl: doctor.imageUrl
            });
        } else {
            setFormData({ name: '', specialty: '', bio: '', consultationFee: 0, imageUrl: `https://i.pravatar.cc/150?u=doc-${Date.now()}` });
        }
    }, [doctor, isOpen]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'consultationFee' ? Number(value) : value }));
    };

    const handleSave = () => {
        if (!formData.name || !formData.specialty || formData.consultationFee <= 0) {
            alert("Name, specialty, and a valid consultation fee are required.");
            return;
        }
        if (doctor) {
            onSave({ ...doctor, ...formData });
        } else {
            onSave(formData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                <div className="space-y-4">
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-surface-light rounded" />
                    <input type="text" name="specialty" placeholder="Specialty" value={formData.specialty} onChange={handleChange} className="w-full p-2 bg-surface-light rounded" />
                    <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} className="w-full p-2 bg-surface-light rounded" rows={3}></textarea>
                    <input type="number" name="consultationFee" placeholder="Consultation Fee (IDR)" value={formData.consultationFee || ''} onChange={handleChange} className="w-full p-2 bg-surface-light rounded" />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Cancel</button>
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

const AdminHealthProviderManagement: React.FC = () => {
    const { doctors, addDoctor, updateDoctor, deleteDoctor } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

    const handleOpenModal = (doctor: Doctor | null = null) => {
        setEditingDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleSave = (data: Omit<Doctor, 'id' | 'availableSlots'> | Doctor) => {
        if ('id' in data) {
            updateDoctor(data);
        } else {
            addDoctor(data);
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-primary flex items-center">
                    <HeartIcon className="h-8 w-8 mr-2"/>
                    Health Provider Management
                </h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Doctor
                </button>
            </div>
             <div className="bg-surface p-4 rounded-lg border border-border-color">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Doctor</th>
                                <th className="px-6 py-3">Specialty</th>
                                <th className="px-6 py-3">Fee</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(doc => (
                                <tr key={doc.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{doc.name}</td>
                                    <td className="px-6 py-4">{doc.specialty}</td>
                                    <td className="px-6 py-4">{new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(doc.consultationFee)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-2">
                                            <button onClick={() => handleOpenModal(doc)} className="p-2 rounded hover:bg-surface-light"><PencilIcon className="h-4 w-4 text-yellow-400"/></button>
                                            <button onClick={() => deleteDoctor(doc.id)} className="p-2 rounded hover:bg-surface-light"><TrashIcon className="h-4 w-4 text-red-500"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <DoctorFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} doctor={editingDoctor} onSave={handleSave} />
        </div>
    );
};

export default AdminHealthProviderManagement;