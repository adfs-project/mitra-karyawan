import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Doctor } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DoctorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
    onSave: (doctor: Doctor | Omit<Doctor, 'id'>) => Promise<any>;
}> = ({ isOpen, onClose, doctor, onSave }) => {
    const [formData, setFormData] = useState<Omit<Doctor, 'id'>>({
        name: '', specialty: '', consultationFee: 0, bio: '', imageUrl: '', availableSlots: []
    });

    React.useEffect(() => {
        if (doctor) {
            setFormData(doctor);
        } else {
            setFormData({
                name: '', specialty: 'Dokter Umum', consultationFee: 50000, bio: '',
                imageUrl: `https://i.pravatar.cc/150?u=doc-${Date.now()}`,
                availableSlots: [{ time: '09:00', isBooked: false }, { time: '10:00', isBooked: false }, { time: '11:00', isBooked: false }]
            });
        }
    }, [doctor, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'consultationFee' ? Number(value) : value }));
    };

    const handleSave = () => {
        const dataToSave = doctor ? { ...doctor, ...formData } : formData;
        onSave(dataToSave).then(onClose);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <h2 className="text-2xl font-bold mb-4">{doctor ? 'Edit Doctor' : 'Add New Doctor'}</h2>
                <div className="space-y-4">
                    <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <input type="text" name="specialty" placeholder="Specialty" value={formData.specialty} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <input type="number" name="consultationFee" placeholder="Consultation Fee" value={formData.consultationFee} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} rows={3} className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea>
                    <input type="text" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Cancel</button>
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

const AdminHealthProviderManagement: React.FC = () => {
    const { doctors, addDoctor, updateDoctor } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const handleOpenModal = (doctor: Doctor | null = null) => {
        setSelectedDoctor(doctor);
        setIsModalOpen(true);
    };

    const handleSaveDoctor = async (doctorData: Doctor | Omit<Doctor, 'id'>) => {
        if ('id' in doctorData) {
            await updateDoctor(doctorData);
        } else {
            await addDoctor(doctorData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Health Provider Management</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Doctor
                </button>
            </div>
            
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-surface-light">
                            <tr>
                                <th scope="col" className="px-6 py-3">Doctor</th>
                                <th scope="col" className="px-6 py-3">Specialty</th>
                                <th scope="col" className="px-6 py-3">Fee</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map(doctor => (
                                <tr key={doctor.id} className="bg-surface border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap flex items-center">
                                        <img src={doctor.imageUrl} alt={doctor.name} className="w-10 h-10 rounded-full mr-3" />
                                        {doctor.name}
                                    </td>
                                    <td className="px-6 py-4">{doctor.specialty}</td>
                                    <td className="px-6 py-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(doctor.consultationFee)}</td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleOpenModal(doctor)} className="p-2 rounded hover:bg-border-color"><PencilIcon className="h-5 w-5 text-yellow-400"/></button>
                                        <button className="p-2 rounded hover:bg-border-color"><TrashIcon className="h-5 w-5 text-red-400"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <DoctorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} doctor={selectedDoctor} onSave={handleSaveDoctor} />
        </div>
    );
};

export default AdminHealthProviderManagement;