import React, { useState, useEffect } from 'react';
import { MapPinIcon } from '@heroicons/react/24/solid';
import { Coordinates } from '../../types';

interface LocationNameProps {
    location?: Coordinates;
}

const LocationName: React.FC<LocationNameProps> = ({ location }) => {
    const [name, setName] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!location) {
            setName(null);
            return;
        }

        // Temporarily disabled sessionStorage caching
        // // Kunci cache unik berdasarkan koordinat dengan presisi 5 angka desimal
        // const cacheKey = `geocache_${location.latitude.toFixed(5)}_${location.longitude.toFixed(5)}`;
        // const cachedName = sessionStorage.getItem(cacheKey);

        // if (cachedName) {
        //     setName(cachedName);
        //     return;
        // }

        const fetchLocationName = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.latitude}&lon=${location.longitude}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch location name');
                }
                const data = await response.json();
                // Ambil 2 bagian pertama dari display_name untuk alamat yang lebih singkat
                const displayName = data.display_name ? data.display_name.split(',').slice(0, 2).join(', ') : 'Location not found';
                setName(displayName);
                // sessionStorage.setItem(cacheKey, displayName); // Temporarily disabled
            } catch (error) {
                console.error("Reverse geocoding failed:", error);
                // Fallback ke koordinat jika API gagal
                setName(`${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocationName();
    }, [location]);

    if (!location) return <span className="text-xs text-text-secondary mt-1 flex items-center">-</span>;

    return (
        <p className="text-xs text-text-secondary mt-1 flex items-center">
            <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
            {isLoading ? (
                <span className="italic">Memuat lokasi...</span>
            ) : (
                <span className="truncate" title={name || ''}>{name}</span>
            )}
        </p>
    );
};

export default LocationName;