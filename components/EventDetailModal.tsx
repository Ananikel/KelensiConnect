import React, { useMemo } from 'react';
import { AppEvent, Member, RSVP, RSVPStatus } from '../types';
import CloseIcon from './icons/CloseIcon';
import CalendarIcon from './icons/CalendarIcon';
import TimeIcon from './icons/TimeIcon';
import LocationIcon from './icons/LocationIcon';

interface EventDetailModalProps {
    event: AppEvent;
    members: Member[];
    onClose: () => void;
    onUpdateRsvps: (eventId: number, newRsvps: RSVP[]) => void;
}

const RSVP_STATUS_MAP: Record<RSVPStatus, string> = {
    'Attending': 'Participe',
    'Maybe': 'Peut-être',
    'Not Attending': 'Ne participe pas'
};

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, members, onClose, onUpdateRsvps }) => {

    const rsvpsByStatus = useMemo(() => {
        const categorized: { [key in RSVPStatus | 'No Response']: Member[] } = {
            'Attending': [],
            'Maybe': [],
            'Not Attending': [],
            'No Response': []
        };
        const respondedMemberIds = new Set(event.rsvps?.map(r => r.memberId));

        event.rsvps?.forEach(rsvp => {
            const member = members.find(m => m.id === rsvp.memberId);
            if (member) {
                categorized[rsvp.status].push(member);
            }
        });
        
        categorized['No Response'] = members.filter(m => !respondedMemberIds.has(m.id));

        return categorized;

    }, [event.rsvps, members]);
    
    const handleRsvpChange = (memberId: number, newStatus: RSVPStatus | 'No Response') => {
        const currentRsvps = event.rsvps ? [...event.rsvps] : [];
        const existingRsvpIndex = currentRsvps.findIndex(r => r.memberId === memberId);

        if (newStatus === 'No Response') {
            if(existingRsvpIndex > -1) {
                currentRsvps.splice(existingRsvpIndex, 1);
            }
        } else {
             if (existingRsvpIndex > -1) {
                currentRsvps[existingRsvpIndex].status = newStatus;
            } else {
                currentRsvps.push({ memberId, status: newStatus });
            }
        }
        onUpdateRsvps(event.id, currentRsvps);
    };

    const MemberRow: React.FC<{member: Member; currentStatus: RSVPStatus | 'No Response'}> = ({member, currentStatus}) => (
        <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-md">
            <div className="flex items-center">
                <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover mr-3" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{member.name}</span>
            </div>
            <select
                value={currentStatus}
                onChange={(e) => handleRsvpChange(member.id, e.target.value as RSVPStatus | 'No Response')}
                className="text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            >
                <option value="No Response">Pas de réponse</option>
                <option value="Attending">Participe</option>
                <option value="Maybe">Peut-être</option>
                <option value="Not Attending">Ne participe pas</option>
            </select>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-200">{event.title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><CloseIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            <CalendarIcon />
                            <span className="ml-2 font-medium">{new Date(event.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            <TimeIcon />
                            <span className="ml-2 font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                            <LocationIcon />
                            <span className="ml-2 font-medium">{event.location}</span>
                        </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">{event.description}</p>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Participants ({rsvpsByStatus['Attending'].length})</h4>
                            <div className="space-y-1">
                                {rsvpsByStatus['Attending'].map(member => <MemberRow key={member.id} member={member} currentStatus="Attending" />)}
                            </div>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Peut-être ({rsvpsByStatus['Maybe'].length})</h4>
                            <div className="space-y-1">
                               {rsvpsByStatus['Maybe'].map(member => <MemberRow key={member.id} member={member} currentStatus="Maybe" />)}
                            </div>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Ne participent pas ({rsvpsByStatus['Not Attending'].length})</h4>
                            <div className="space-y-1">
                                {rsvpsByStatus['Not Attending'].map(member => <MemberRow key={member.id} member={member} currentStatus="Not Attending" />)}
                            </div>
                        </div>
                         <div>
                            <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">Pas de réponse ({rsvpsByStatus['No Response'].length})</h4>
                            <div className="space-y-1">
                               {rsvpsByStatus['No Response'].map(member => <MemberRow key={member.id} member={member} currentStatus="No Response" />)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end">
                    <button onClick={onClose} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Fermer</button>
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;