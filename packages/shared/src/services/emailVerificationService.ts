
// This is a mock service to simulate checking if an email is "live"
// In a real-world scenario, this would be a third-party API call (e.g., Hunter, ZeroBounce)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const invalidKeywords = ['test', 'fake', 'inactive', 'spam', 'example'];

export const verifyEmailIsActive = async (email: string): Promise<{ success: boolean; message: string }> => {
    await sleep(1500); // Simulate network delay

    const lowerCaseEmail = email.toLowerCase();

    // 1. Basic format check (though the input type="email" helps)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lowerCaseEmail)) {
        return { success: false, message: "Format email tidak valid." };
    }

    // 2. Check for common non-active or test keywords
    if (invalidKeywords.some(keyword => lowerCaseEmail.includes(keyword))) {
        return { success: false, message: "Email ini terdeteksi sebagai alamat tidak aktif atau testing." };
    }

    // 3. Simulate a random failure rate for unreachable domains etc.
    if (Math.random() < 0.15) { // 15% chance of failure
        return { success: false, message: "Server email tidak merespon. Coba email lain." };
    }

    // 4. Success
    return { success: true, message: "Email aktif dan dapat dijangkau." };
};
