import { ScalabilityService, ScalabilityServiceStatus } from '../types';

type LogCallback = (status: ScalabilityServiceStatus, log: string, metadata?: Record<string, any>) => void;

const provisionSteps: Record<ScalabilityService['type'], string[]> = {
    redis: [
        "INITIATING: `gcloud redis instances create mitra-cache --tier=BASIC`",
        "STATUS: Provisioning resources (2-5 min)...",
        "LOG: Creating instance... done.",
        "LOG: Setting network configuration... done.",
        "LOG: Waiting for instance to become ready... done.",
        "OUTPUT: Instance `mitra-cache` is now ACTIVE.",
        "AWAITING_CONFIG: Waiting for backend service to establish connection...",
    ],
    rabbitmq: [
        "INITIATING: `gcloud pubsub topics create async-task-queue`",
        "STATUS: Creating message queue service...",
        "LOG: Topic `async-task-queue` created.",
        "LOG: Creating worker subscriptions... done.",
        "LOG: Deploying worker pool... done.",
        "OUTPUT: RabbitMQ service is now provisioned.",
        "AWAITING_CONFIG: Waiting for services to register tasks...",
    ],
    read_replicas: [
        "INITIATING: `gcloud sql instances replicas create mitra-db-primary --replica-name=mitra-db-replica-1`",
        "STATUS: Provisioning database replica (5-10 min)...",
        "LOG: Cloning primary instance... 95% complete...",
        "LOG: Cloning complete. Starting replica instance...",
        "LOG: Configuring replication streams... done.",
        "OUTPUT: Read replica `mitra-db-replica-1` is now ACTIVE.",
        "AWAITING_CONFIG: Updating load balancer to route read traffic...",
    ],
    load_balancer: [
        "INITIATING: `gcloud compute backend-services create app-backend-service --global`",
        "STATUS: Provisioning Global Load Balancer...",
        "LOG: Creating health checks... done.",
        "LOG: Attaching server instance group... done.",
        "LOG: Configuring forwarding rule... done.",
        "OUTPUT: Load Balancer is now provisioned.",
        "AWAITING_CONFIG: Enabling Auto-Scaling policy `cpu-utilization-policy`...",
    ],
    cdn: [
        "INITIATING: `gcloud compute backend-buckets create static-assets --gcs-bucket-name=mitra-assets`",
        "STATUS: Enabling Cloud CDN on backend bucket...",
        "LOG: Propagating configuration to edge locations... (1-5 min)",
        "LOG: North America... POPULATED.",
        "LOG: Europe... POPULATED.",
        "LOG: Asia... POPULATED.",
        "OUTPUT: CDN is now provisioned globally.",
        "AWAITING_CONFIG: Purging stale cache...",
    ],
    db_sharding: [
        "INITIATING: `gcloud spanner instances create mitra-db-sharded --config=regional-asia-southeast1 --nodes=3`",
        "STATUS: Provisioning sharded database infrastructure (10-15 min)...",
        "LOG: Creating instance... done.",
        "LOG: Allocating nodes... done.",
        "OUTPUT: Sharded infrastructure is provisioned.",
        "AWAITING_CONFIG: Starting data migration from primary DB to sharded instance...",
        "MIGRATING: Migrating user table... 25%",
        "MIGRATING: Migrating transactions table... 50%",
        "MIGRATING: Migrating products table... 75%",
        "MIGRATING: Finalizing migration... 100%",
    ]
};

const serviceCosts: Record<ScalabilityService['type'], number> = {
    redis: 50,
    rabbitmq: 75,
    read_replicas: 250,
    load_balancer: 40,
    cdn: 120,
    db_sharding: 1500,
};

const possibleFailures = [
    "API Quota Exceeded. Please try again later.",
    "Resource provisioning timed out in zone asia-southeast1-a.",
    "Insufficient permissions for the service account.",
    "Network configuration conflict detected.",
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const provisionService = (type: ScalabilityService['type'], onLog: LogCallback): Promise<number> => {
    return new Promise(async (resolve, reject) => {
        const steps = provisionSteps[type];
        if (!steps) {
            return reject(new Error("Invalid service type specified."));
        }

        for (let i = 0; i < steps.length; i++) {
            const currentStep = steps[i];
            let newStatus = ScalabilityServiceStatus.Provisioning;
            let logMessage = currentStep;
            let metadata: Record<string, any> | undefined = undefined;

            if (currentStep.startsWith("AWAITING_CONFIG:")) {
                newStatus = ScalabilityServiceStatus.AwaitingConfig;
                logMessage = currentStep.replace("AWAITING_CONFIG: ", "");
            } else if (currentStep.startsWith("MIGRATING:")) {
                newStatus = ScalabilityServiceStatus.Migrating;
                logMessage = currentStep.replace("MIGRATING: ", "");
                if (type === 'db_sharding') {
                    const progress = parseInt(currentStep.match(/\d+/)?.[0] || '0');
                    metadata = { shards: Math.ceil(progress / 25) + 1 };
                }
            }
            
            onLog(newStatus, logMessage, metadata);

            // Simulate random failure
            if (i > 1 && Math.random() > 0.9) { // 10% chance of failure after step 2
                const failureReason = possibleFailures[Math.floor(Math.random() * possibleFailures.length)];
                return reject(new Error(failureReason));
            }
            
            await sleep(1500 + Math.random() * 1000); // Simulate network latency & work
        }

        // Final success
        if (type === 'cdn') {
            onLog(ScalabilityServiceStatus.Active, "Finalizing CDN configuration.", { cacheHitRatio: 95, latency: 45 });
        }

        await sleep(1000);
        resolve(serviceCosts[type]);
    });
};
