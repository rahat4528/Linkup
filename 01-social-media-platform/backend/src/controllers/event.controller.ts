import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { memoryStore, StoredEvent, StoredEventRsvp } from '../services/store.service';

export class EventController {
  static createEvent(req: AuthenticatedRequest, res: Response): void {
    const creatorId = req.user!.id;
    const { title, description, location, eventDate } = req.body;

    if (!title || !description || !eventDate) {
      res.status(400).json({ error: 'Title, description, and event date are required' });
      return;
    }

    const event: StoredEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      title: title.trim(),
      description,
      location,
      eventDate: new Date(eventDate),
      creatorId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.events.push(event);

    // Default creator RSVP to GOING
    const rsvp: StoredEventRsvp = {
      id: `rsvp_${Date.now()}`,
      eventId: event.id,
      userId: creatorId,
      status: 'GOING',
      createdAt: new Date(),
    };
    memoryStore.eventRsvps.push(rsvp);

    res.status(201).json({ event, rsvp });
  }

  static getEvents(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user ? req.user.id : null;

    const list = memoryStore.events.map((e) => {
      const rsvps = memoryStore.eventRsvps.filter((r) => r.eventId === e.id);
      const userRsvp = userId ? rsvps.find((r) => r.userId === userId)?.status || null : null;
      return {
        ...e,
        goingCount: rsvps.filter((r) => r.status === 'GOING').length,
        interestedCount: rsvps.filter((r) => r.status === 'INTERESTED').length,
        userRsvp,
      };
    });

    res.status(200).json({ events: list });
  }

  static rsvpEvent(req: AuthenticatedRequest, res: Response): void {
    const userId = req.user!.id;
    const eventId = req.params.id as string;
    const { status = 'GOING' } = req.body;

    const event = memoryStore.events.find((e) => e.id === eventId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    let rsvp = memoryStore.eventRsvps.find((r) => r.eventId === eventId && r.userId === userId);
    if (rsvp) {
      rsvp.status = status;
    } else {
      rsvp = {
        id: `rsvp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        eventId,
        userId,
        status,
        createdAt: new Date(),
      };
      memoryStore.eventRsvps.push(rsvp);
    }

    res.status(200).json({ message: 'RSVP updated', rsvp });
  }
}
