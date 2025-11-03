import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@mk/shared';
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon } from '@heroicons/react/24/outline';
import BookingModal from '../../../components/user/health/BookingModal';

const DoctorDetailScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { doctors } = useData();
    const doctor = doctors.find(d => d.id === id);

    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isBookingModalOpen, setBookingModalOpen] = useState(false);

    const handleBookClick = (slotTime: string) => {
        setSelectedSlot(slotTime);
        setBookingModalOpen(true);
    };
    
    if (!doctor) {
        return <div className="p-4 text-center">Dokter tidak ditemukan.</div>;
    }

    return (
        <div className="pb-4">
            <div className="p-4 flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold ml-4">Profil Dokter</h1>
            </div>
            
            <div className="p-4 bg-surface m-4 rounded-lg border border-border-color">
                <div className="flex items-center space-x-4">
                    <img src={doctor.imageUrl} alt={doctor.name} className="w-24 h-24 rounded-full border-2 border-primary" />
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary">{doctor.name}</h2>
                        <p className="text-primary font-semibold">{doctor.specialty}</p>
                    </div>
                </div>
                <p className="text-text-secondary mt-4 text-sm">{doctor.bio}</p>
                 <div className="mt-4 text-lg font-bold">
                    Biaya Konsultasi: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(doctor.consultationFee)}
                </div>
            </div>
            
            <div className="m-4">
                <h3 className="text-lg font-bold text-text-primary flex items-center mb-4">
                    <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary"/>
                    Pilih Jadwal Konsultasi
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {doctor.availableSlots.map(slot => (
                        <button 
                            key={slot.time}
                            onClick={() => handleBookClick(slot.time)}
                            disabled={slot.isBooked}
                            className={`p-3 rounded-lg text-center font-semibold border-2 transition-colors
                                ${slot.isBooked 
                                    ? 'bg-surface text-text-secondary border-border-color cursor-not-allowed'
                                    : 'bg-surface-light border-border-color hover:border-primary hover:bg-primary/20'
                                }
                            `}
                        >
                            <ClockIcon className="h-5 w-5 mx-auto mb-1"/>
                            {slot.time}
                        </button>
                    ))}
                </div>
            </div>

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setBookingModalOpen(false)}
                doctor={doctor}
                slotTime={selectedSlot}
            />
        </div>
    );
};

export default DoctorDetailScreen;