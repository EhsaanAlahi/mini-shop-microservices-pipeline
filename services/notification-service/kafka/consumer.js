const { Kafka } = require("kafkajs");
const Notification = require("../models/Notification");


// Validate environment variables

if (!process.env.KAFKA_BROKER) {
    throw new Error("KAFKA_BROKER is missing");
}

if (!process.env.KAFKA_CLIENT_ID) {
    throw new Error("KAFKA_CLIENT_ID is missing");
}

if (!process.env.KAFKA_GROUP_ID) {
    throw new Error("KAFKA_GROUP_ID is missing");
}


// Kafka configuration

const kafka = new Kafka({
    clientId: process.env.KAFKA_CLIENT_ID,

    brokers: [
        process.env.KAFKA_BROKER
    ],

    retry: {
        initialRetryTime: 1000,
        retries: 10
    }
});


// Kafka Admin

const admin = kafka.admin();


// Kafka Consumer

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID
});


// Kafka Topic

const TOPIC = "product-created";


// Create Kafka Topic

const createTopic = async () => {

    try {

        await admin.connect();

        console.log(
            "Kafka admin connected"
        );


        const topics = await admin.listTopics();


        if (!topics.includes(TOPIC)) {

            console.log(
                `Kafka topic "${TOPIC}" does not exist. Creating topic...`
            );


            await admin.createTopics({

                topics: [

                    {
                        topic: TOPIC,

                        numPartitions: 3,

                        replicationFactor: 1
                    }

                ],

                waitForLeaders: true

            });


            console.log(
                `Kafka topic "${TOPIC}" created successfully`
            );

        } else {

            console.log(
                `Kafka topic "${TOPIC}" already exists`
            );

        }


        await admin.disconnect();

        console.log(
            "Kafka admin disconnected"
        );

    } catch (error) {

        console.error(
            "Kafka topic creation error:",
            error
        );

        try {

            await admin.disconnect();

        } catch (disconnectError) {

            console.error(
                "Kafka admin disconnect error:",
                disconnectError
            );

        }

        throw error;
    }
};


// Start Consumer

const startConsumer = async () => {

    try {

        /*
         * Step 1:
         * Create Kafka topic after Kafka is available
         */

        await createTopic();


        /*
         * Step 2:
         * Connect Kafka consumer
         */

        await consumer.connect();

        console.log(
            "Kafka consumer connected"
        );


        /*
         * Step 3:
         * Subscribe to topic
         */

        await consumer.subscribe({

            topic: TOPIC,

            fromBeginning: true

        });


        console.log(
            `Subscribed to ${TOPIC} topic`
        );


        /*
         * Step 4:
         * Start consuming messages
         */

        await consumer.run({

            eachMessage: async ({
                message
            }) => {

                try {

                    if (!message.value) {

                        console.log(
                            "Received empty Kafka message"
                        );

                        return;
                    }


                    /*
                     * Convert Kafka message
                     * into JavaScript object
                     */

                    const data = JSON.parse(
                        message.value.toString()
                    );


                    console.log(
                        "Product created event received:",
                        data
                    );


                    /*
                     * Create notification
                     * in MongoDB
                     */

                    const notification =
                        await Notification.create({

                            userId: data.adminId,

                            type: "PRODUCT_CREATED",

                            message:
                                `Product "${data.productName}" added successfully`,

                            data: {

                                productId:
                                    data.productId,

                                productName:
                                    data.productName

                            }

                        });


                    console.log(
                        "Notification created:",
                        notification._id
                    );

                } catch (error) {

                    console.error(
                        "Message processing error:",
                        error
                    );

                }

            }

        });

    } catch (error) {

        console.error(
            "Kafka consumer startup error:",
            error
        );

        process.exit(1);
    }
};


// Graceful shutdown

const shutdown = async () => {

    try {

        console.log(
            "Shutting down Kafka consumer..."
        );


        await consumer.disconnect();


        console.log(
            "Kafka consumer disconnected"
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "Kafka shutdown error:",
            error
        );

        process.exit(1);
    }
};


process.on(
    "SIGINT",
    shutdown
);

process.on(
    "SIGTERM",
    shutdown
);


module.exports = startConsumer;