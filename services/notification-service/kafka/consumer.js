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
    ]
});


// Kafka Consumer

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID
});


// Start Consumer

const startConsumer = async () => {

    try {

        await consumer.connect();

        console.log(
            "Kafka consumer connected"
        );


        await consumer.subscribe({
            topic: "product-created",
            fromBeginning: true
        });


        console.log(
            "Subscribed to product-created topic"
        );


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


                    const data = JSON.parse(
                        message.value.toString()
                    );


                    console.log(
                        "Product created event received:",
                        data
                    );


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


module.exports = startConsumer;