import Message from "../models/message.model.js";
import { StatusCodes } from 'http-status-codes';

const postMessage = async (req, res) => {
    try {
        const newMessage = new Message({
            ...req.body,
        });
        const savedMessage = await newMessage.save();
        res.status(StatusCodes.CREATED).json(savedMessage);

    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}

const getMessage = async (req, res) => {
    try {
        const { reciever, sender } = req.body; // reciever-samne wala sender-me

        const sendMessages = await Message.find({
            sender: sender,
            reciever: reciever,
        }).sort({ updatedAt: 1 });

        const recievedMessages = await Message.find({
            sender: reciever,
            reciever: sender,
        }).sort({ updatedAt: 1 });

        const combinedMessages = [...sendMessages, ...recievedMessages];
        combinedMessages.sort((a, b) => a.updatedAt - b.updatedAt);

        const allMessages = combinedMessages.map((msg) => {
            return {
                myself: msg.sender === sender,
                message: msg.message,
            }
        });

        res.status(StatusCodes.OK).json(allMessages);
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
}

export default {
    getMessage,
    postMessage
};