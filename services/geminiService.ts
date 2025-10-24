import { GoogleGenAI, Type } from "@google/genai";
import { FullBooking, RoomType } from "../types";
import { DINING_OPTIONS } from "../constants";

const generatePrompt = (booking: FullBooking, roomTypes: RoomType[], totalRooms: number, totalGuests: number): string => {
  const { details, roomSelection } = booking;

  const roomSummary = Object.entries(roomSelection)
    .filter(([, count]) => count > 0)
    .map(([roomId, count]) => {
      const room = roomTypes.find(r => r.id === roomId);
      return `${count} x ${room?.name || 'Habitación Desconocida'}`;
    })
    .join(', ');

  let prompt = `Actúa como un conserje de hotel creativo. Genera un breve y acogedor mensaje de confirmación para una reserva de grupo a nombre de ${details.name}.
La reserva es para ${totalGuests} personas en ${totalRooms} habitaciones, desde el ${details.checkIn} hasta el ${details.checkOut}.
Las habitaciones seleccionadas son: ${roomSummary}.`;

  const diningSummary = Object.entries(booking.details.dining)
    .map(([date, services]) => {
      const dailyServices = Object.entries(services)
        .filter(([, diners]) => diners > 0)
        .map(([serviceId, diners]) => {
          const serviceName = DINING_OPTIONS.find(opt => opt.id === serviceId)?.label || serviceId;
          return `${diners} ${serviceName}`;
        })
        .join(', ');
      
      if (dailyServices) {
          const formattedDate = new Date(date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', timeZone: 'UTC' });
          return `El ${formattedDate}: ${dailyServices}.`;
      }
      return null;
    })
    .filter(Boolean)
    .join('\n');

  if (diningSummary) {
    prompt += `\nTambién han solicitado los siguientes servicios de comedor:\n${diningSummary}`;
  }

  if (details.observations) {
    prompt += `\nEl cliente ha dejado las siguientes observaciones: "${details.observations}". Ten esto en cuenta para el tono del mensaje.`;
  }
  
  prompt += `\nIncluye un nombre creativo y divertido para la estancia de su grupo.
La respuesta debe estar en formato JSON con dos claves: "groupStayName" y "confirmationMessage".
Mantén el mensaje cálido, emocionante y personalizado.`;

  return prompt;
};


export const generateBookingConfirmation = async (
  booking: FullBooking,
  roomTypes: RoomType[],
  totalRooms: number,
  totalGuests: number
): Promise<{ groupStayName: string; confirmationMessage: string; }> => {
  if (!process.env.API_KEY) {
    // Return a mock response if API key is not set
    return {
        groupStayName: "La Aventura del Viajero",
        confirmationMessage: `¡Hola ${booking.details.name}! Tu grupo está listo para una estancia inolvidable. Hemos preparado todo para que vuestra experiencia sea cómoda y emocionante. ¡Nos vemos pronto!`
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = generatePrompt(booking, roomTypes, totalRooms, totalGuests);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            groupStayName: {
              type: Type.STRING,
              description: "Un nombre creativo y divertido para la estancia del grupo."
            },
            confirmationMessage: {
              type: Type.STRING,
              description: "Un mensaje de confirmación cálido, acogedor y personalizado."
            },
          },
          required: ["groupStayName", "confirmationMessage"],
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error generating confirmation:", error);
    // Return a fallback message on error
    return {
        groupStayName: "Estancia Fantástica",
        confirmationMessage: `¡Confirmado, ${booking.details.name}! La reserva de tu grupo ha sido un éxito. Estamos encantados de darles la bienvenida y asegurarles una estancia maravillosa.`
    };
  }
};