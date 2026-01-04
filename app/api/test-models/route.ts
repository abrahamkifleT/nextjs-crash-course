import connectToDatabase from "@/lib/mongodb";
import { Event, Booking } from "@/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // 1. Create a Test Event
    const eventData = {
      title: "Next.js Conf 2026", // Slug should be 'next-js-conf-2026'
      description: "The global Next.js conference.",
      overview: "Learn about the latest features.",
      image: "https://example.com/image.png",
      venue: "Moscone Center",
      location: "San Francisco, CA",
      date: "2026-10-25", // Should be normalized
      time: " 10:00 AM ", // Should be trimmed
      mode: "hybrid",
      audience: "Developers",
      agenda: ["Keynote", "Workshops"],
      organizer: "Vercel",
      tags: ["nextjs", "react"],
    };

    // Clean up previous test data
    await Event.deleteMany({ title: eventData.title });
    await Booking.deleteMany({ email: "test@example.com" });

    const newEvent = await Event.create(eventData);

    // 2. Test Invalid Booking (Non-existent Event)
    let invalidBookingError = null;
    try {
      // Use a valid ObjectId format but one that likely doesn't exist
      const fakeId = newEvent._id.toString().replace(/./, "0");
      await Booking.create({
        eventId: fakeId,
        email: "test@example.com",
      });
    } catch (e) {
      invalidBookingError = e;
    }

    // 3. Test Valid Booking
    const newBooking = await Booking.create({
      eventId: newEvent._id,
      email: "test@example.com",
    });

    return NextResponse.json({
      message: "Model verification successful",
      event: newEvent,
      booking: newBooking,
      slugGenerated: newEvent.slug === "nextjs-conf-2026",
      dateNormalized: newEvent.date !== "2026-10-25", // Should be ISO string
      invalidBookingBlocked: !!invalidBookingError,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Model verification failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
