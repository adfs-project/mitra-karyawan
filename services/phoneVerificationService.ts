// This is a mock service to simulate sending an OTP to a phone number.
// In a real-world scenario, this would involve a third-party SMS gateway API (e.g., Twilio).

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const verifyPhoneNumber = async (phone: string): Promise<{ success: boolean; message: string }> => {
    await sleep(1500); // Simulate network delay for sending OTP

    // 1. Basic format check (starts with '08', has 10-13 digits)
    if (!/^08\d{8,11}$/.test(phone)) {
        return { success: false, message: "Format nomor telepon tidak valid. Gunakan format 08xxxxxxxxxx." };
    }

    // 2. Simulate sending an OTP and asking the user to enter it.
    // In this mock, we'll use a simple prompt. The correct OTP is hardcoded.
    const MOCK_OTP = "123456";
    const userOtp = prompt(`(SIMULASI) Kami telah mengirimkan kode OTP ke ${phone}. Masukkan kode (OTP: ${MOCK_OTP}):`);

    if (userOtp === MOCK_OTP) {
        return { success: true, message: "Nomor telepon berhasil diverifikasi." };
    } else if (userOtp === null) {
        // User cancelled the prompt
        return { success: false, message: "Verifikasi dibatalkan." };
    } else {
        return { success: false, message: "Kode OTP salah." };
    }
};
