import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { ArrowLeftIcon, PaperAirplaneIcon, DocumentPlusIcon } from '@heroicons/react/24/outline';
import { DigitalPrescriptionItem } from '../../../types';

const DigitalPrescription: React.FC<{
    prescription: DigitalPrescriptionItem[];
    onRedeem: () => void;
}> = ({ prescription, onRedeem }) => (
    <div className="bg-surface-light p-4 rounded-lg border border-primary">
        <h3 className="text-lg font-bold text-primary flex items-center mb-3">
            <DocumentPlusIcon className="h-5 w-5 mr-2" />
            Resep Digital
        </h3>
        <ul className="space-y-2">
            {prescription.map(item => (
                <li key={item.productId} className="border-b border-border-color pb-2">
                    <p className="font-semibold text-text-primary">{item.medicineName} ({item.quantity})</p>
                    <p className="text-xs text-text-secondary">{item.dosage}</p>
                </li>
            ))}
        </ul>
        <button onClick={onRedeem} className="w-full btn-primary p-2 mt-4 rounded-lg font-bold text-sm">
            Tebus Resep di Apotek
        </button>
    </div>
);


const ConsultationRoomScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { consultations, addConsultationMessage, completeConsultation, products, addToCart, addNotification } = useData();
    const consultation = consultations.find(c => c.id === id);
    
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [consultation?.chatHistory]);

    const handleSend = () => {
        if (!consultation || !message.trim()) return;
        addConsultationMessage(consultation.id, message, 'user');
        setMessage('');

        // Simulate doctor's response
        setTimeout(() => {
            const responses = ["Baik, saya mengerti.", "Tolong jelaskan lebih lanjut.", "Ada gejala lain?", "Oke, saya catat."];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addConsultationMessage(consultation.id, randomResponse, 'doctor');
        }, 1500);
    };

    const handleComplete = () => {
        if (!consultation) return;
        // Simulate a prescription
        const prescription: DigitalPrescriptionItem[] = [
            { medicineName: 'Paracetamol 500mg', productId: 'med-001', dosage: '3x1 Sehari sesudah makan', quantity: 1 },
            { medicineName: 'Amoxicillin 500mg', productId: 'med-002', dosage: '3x1 Sehari, habiskan', quantity: 1 },
        ];
        completeConsultation(consultation.id, prescription);
    };
    
    const handleRedeemPrescription = () => {
        if (!consultation?.prescription) return;
        
        consultation.prescription.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                addToCart(item.productId, item.quantity);
            }
        });
        
        addNotification(consultation.userId, "Obat dari resep telah ditambahkan ke keranjang.", 'success');
        navigate('/cart');
    };

    if (!consultation) {
        return <div className="p-4 text-center">Konsultasi tidak ditemukan.</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 flex items-center border-b border-border-color sticky top-0 bg-surface z-10">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div className="ml-4">
                    <h1 className="text-lg font-bold">Dr. {consultation.doctorName}</h1>
                    <p className="text-sm text-text-secondary">{consultation.doctorSpecialty}</p>
                </div>
            </header>

            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                 {consultation.chatHistory.map((chat, index) => (
                    <div key={index} className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${chat.sender === 'user' ? 'bg-primary text-black' : 'bg-surface-light'}`}>
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{chat.message}</p>
                        </div>
                    </div>
                 ))}
                 {consultation.status === 'Completed' && consultation.prescription && (
                    <DigitalPrescription prescription={consultation.prescription} onRedeem={handleRedeemPrescription} />
                 )}
                <div ref={messagesEndRef} />
            </main>
            
            {consultation.status !== 'Completed' && (
                <footer className="p-4 border-t border-border-color bg-surface">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ketik pesan..."
                            className="w-full bg-surface-light border border-border-color rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button onClick={handleSend} disabled={!message.trim()} className="p-2 btn-secondary rounded-full disabled:opacity-50">
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <button onClick={handleComplete} className="w-full mt-2 btn-secondary p-2 rounded-lg font-bold text-sm">
                        Akhiri Konsultasi & Dapatkan Resep
                    </button>
                </footer>
            )}
        </div>
    );
};

export default ConsultationRoomScreen;