import React, { useState, useMemo } from 'react';
import { AppEvent, Member, RSVP } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import DeleteIcon from './icons/DeleteIcon';
import CalendarIcon from './icons/CalendarIcon';
import TimeIcon from './icons/TimeIcon';
import LocationIcon from './icons/LocationIcon';
import UsersIcon from './icons/UsersIcon';
import EventDetailModal from './EventDetailModal';

interface EventsProps {
    events: AppEvent[];
    setEvents: React.Dispatch<React.SetStateAction<AppEvent[]>>;
    members: Member[];
}

const EventCard: React.FC<{ event: AppEvent; onEdit: () => void; onDelete: () => void; onView: () => void; isPast: boolean }> = ({ event, onEdit, onDelete, onView, isPast }) => {
    const attendeesCount = event.rsvps?.filter(r => r.status === 'Attending').length || 0;
    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${isPast ? 'opacity-60' : 'hover:-translate-y-1'}`}>
            <button type="button" onClick={onView} className="p-5 text-left flex-grow focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-t-lg">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">{event.title}</h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                    <div className="flex items-center">
                        <CalendarIcon />
                        <span className="ml-2">{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center">
                        <TimeIcon />
                        <span className="ml-2">{event.time}</span>
                    </div>
                    <div className="flex items-center">
                        <LocationIcon />
                        <span className="ml-2">{event.location}</span>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mt-4 text-sm flex-grow">{event.description}</p>
            </button>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 flex justify-between items-center">
                 <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-5 h-5"><UsersIcon /></div>
                    <span className="ml-2 font-medium">{attendeesCount} participant(s)</span>
                 </div>
                 <div className="flex space-x-3">
                    <button onClick={onEdit} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label={`Modifier l'événement ${event.title}`}>
                        <EditIcon />
                    </button>
                    <button onClick={onDelete} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" aria-label={`Supprimer l'événement ${event.title}`}>
                        <DeleteIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Events: React.FC<EventsProps> = ({ events, setEvents, members }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
    const [eventToDelete, setEventToDelete] = useState<AppEvent | null>(null);
    const [viewingEvent, setViewingEvent] = useState<AppEvent | null>(null);

    const sortedEvents = useMemo(() => {
        return [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events]);

    const upcomingEvents = sortedEvents.filter(e => e.date >= new Date().toISOString().split('T')[0]);
    const pastEvents = sortedEvents.filter(e => e.date < new Date().toISOString().split('T')[0]).reverse();


    const handleOpenModal = (event: AppEvent | null = null) => {
        setEditingEvent(event);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingEvent(null);
    };

    const handleSaveEvent = (eventData: Omit<AppEvent, 'id'> & { id?: number }) => {
        if (eventData.id) { // Editing
            setEvents(events.map(e => e.id === eventData.id ? { ...e, ...eventData } : e));
        } else { // Adding
            const newEvent: AppEvent = { ...eventData, id: Date.now(), rsvps: [] };
            setEvents([...events, newEvent]);
        }
        handleCloseModal();
    };
    
    const handleUpdateRsvps = (eventId: number, newRsvps: RSVP[]) => {
        setEvents(prevEvents => 
            prevEvents.map(event => 
                event.id === eventId ? { ...event, rsvps: newRsvps } : event
            )
        );
        // Also update the viewingEvent state to reflect the change immediately in the modal
        if (viewingEvent && viewingEvent.id === eventId) {
            setViewingEvent(prev => prev ? { ...prev, rsvps: newRsvps } : null);
        }
    };

    const handleOpenDeleteModal = (event: AppEvent) => {
        setEventToDelete(event);
    };

    const handleCloseDeleteModal = () => {
        setEventToDelete(null);
    };

    const handleConfirmDelete = () => {
        if (eventToDelete) {
            setEvents(events.filter(e => e.id !== eventToDelete.id));
            handleCloseDeleteModal();
        }
    };
    
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Calendrier des Événements</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <PlusIcon />
                    <span className="ml-2">Ajouter un événement</span>
                </button>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b dark:border-gray-700 pb-2">Événements à venir</h3>
                    {upcomingEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map(event => <EventCard key={event.id} event={event} onView={() => setViewingEvent(event)} onEdit={() => handleOpenModal(event)} onDelete={() => handleOpenDeleteModal(event)} isPast={false}/>)}
                        </div>
                    ) : (
                         <p className="text-gray-500 dark:text-gray-400 text-center py-4">Aucun événement à venir.</p>
                    )}
                </div>
                 <div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 border-b dark:border-gray-700 pb-2">Événements passés</h3>
                    {pastEvents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pastEvents.map(event => <EventCard key={event.id} event={event} onView={() => setViewingEvent(event)} onEdit={() => handleOpenModal(event)} onDelete={() => handleOpenDeleteModal(event)} isPast={true}/>)}
                        </div>
                    ) : (
                         <p className="text-gray-500 dark:text-gray-400 text-center py-4">Aucun événement passé.</p>
                    )}
                </div>
            </div>

            {isModalOpen && <EventModal event={editingEvent} onSave={handleSaveEvent} onClose={handleCloseModal} />}
            {viewingEvent && (
                <EventDetailModal
                    event={viewingEvent}
                    members={members}
                    onClose={() => setViewingEvent(null)}
                    onUpdateRsvps={handleUpdateRsvps}
                />
            )}
            {eventToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                         <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">Confirmer la suppression</h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Êtes-vous sûr de vouloir supprimer l'événement <strong>"{eventToDelete.title}"</strong> ? Cette action est irréversible.
                            </p>
                         </div>
                        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end space-x-3">
                            <button type="button" onClick={handleCloseDeleteModal} className="bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Annuler</button>
                            <button type="button" onClick={handleConfirmDelete} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">Supprimer</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

const EventModal: React.FC<{ event: AppEvent | null; onSave: (data: Omit<AppEvent, 'id'> & { id?: number }) => void; onClose: () => void; }> = ({ event, onSave, onClose }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [date, setDate] = useState(event?.date || '');
    const [time, setTime] = useState(event?.time || '');
    const [location, setLocation] = useState(event?.location || '');
    const [description, setDescription] = useState(event?.description || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: event?.id, title, date, time, location, description });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">{event ? 'Modifier' : 'Ajouter'} un événement</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800" aria-label="Fermer"><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre de l'événement</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} min="2022-01-01" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                        </div>
                         <div>
                            <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Heure</label>
                            <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lieu</label>
                        <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200" required />
                    </div>
                    <div className="pt-4 flex justify-end">
                        <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md mr-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Annuler</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


export default Events;