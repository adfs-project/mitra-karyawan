type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface ServiceState {
    state: CircuitState;
    failureCount: number;
    lastFailureTime: number | null;
}

const FAILURE_THRESHOLD = 3;
const COOLDOWN_PERIOD = 30000; // 30 seconds

class CircuitBreakerService {
    private services: Record<string, ServiceState> = {};

    private getServiceState(serviceName: string): ServiceState {
        if (!this.services[serviceName]) {
            this.services[serviceName] = {
                state: 'CLOSED',
                failureCount: 0,
                lastFailureTime: null,
            };
        }
        return this.services[serviceName];
    }

    public allowRequest(serviceName: string): boolean {
        const service = this.getServiceState(serviceName);

        if (service.state === 'OPEN') {
            const now = Date.now();
            if (service.lastFailureTime && (now - service.lastFailureTime) > COOLDOWN_PERIOD) {
                console.warn(`[CircuitBreaker] Cooldown for ${serviceName} ended. Moving to HALF_OPEN state.`);
                service.state = 'HALF_OPEN';
                return true; // Allow one trial request
            }
            console.error(`[CircuitBreaker] Request to ${serviceName} blocked. Circuit is OPEN.`);
            return false;
        }

        return true; // 'CLOSED' or 'HALF_OPEN'
    }

    public recordFailure(serviceName: string): void {
        const service = this.getServiceState(serviceName);
        
        if (service.state === 'HALF_OPEN') {
            this.trip(serviceName); // The trial request failed, re-open the circuit
        } else {
            service.failureCount++;
            if (service.failureCount >= FAILURE_THRESHOLD) {
                this.trip(serviceName);
            }
        }
    }

    public recordSuccess(serviceName: string): void {
        const service = this.getServiceState(serviceName);
        if (service.state === 'HALF_OPEN') {
            console.log(`[CircuitBreaker] Success in HALF_OPEN state for ${serviceName}. Closing circuit.`);
        }
        service.state = 'CLOSED';
        service.failureCount = 0;
        service.lastFailureTime = null;
    }
    
    private trip(serviceName: string): void {
        const service = this.getServiceState(serviceName);
        console.error(`[CircuitBreaker] Threshold reached for ${serviceName}. Tripping circuit to OPEN state.`);
        service.state = 'OPEN';
        service.lastFailureTime = Date.now();
    }
}

// Singleton instance
const circuitBreaker = new CircuitBreakerService();
export default circuitBreaker;
