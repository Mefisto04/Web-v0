import { Server } from "socket.io";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default function handler(req: any, res: any) {
    if (!res.socket.server.io) {
        const io = new Server(res.socket.server, {
            path: "/api/socket",
        });

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            socket.on("join-room", ({ roomID }) => {
                socket.join(roomID);
                console.log(`User joined room: ${roomID}`);
            });

            socket.on("send-offer", ({ roomID, offer }) => {
                socket.to(roomID).emit("receive-offer", offer);
            });

            socket.on("send-answer", ({ roomID, answer }) => {
                socket.to(roomID).emit("receive-answer", answer);
            });

            socket.on("send-ice-candidate", ({ roomID, candidate }) => {
                socket.to(roomID).emit("receive-ice-candidate", candidate);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });

        res.socket.server.io = io;
    }
    res.end();
}
