import type { Server } from "socket.io";

let socketServer: Server | null = null;

export function configureSocketServer(server: Server) {
  socketServer = server;
}

export function emitBookingNotification(notification: {
  _id: string;
  bookingRef: string;
  bookingId: string;
  customerName: string;
  serviceName: string;
  appointmentDate: Date;
  createdAt: Date;
}) {
  if (!socketServer) {
    throw new Error("The live notification server has not been configured.");
  }
  socketServer.to("admins").emit("booking-notification", {
    ...notification,
    isRead: false,
  });
}
