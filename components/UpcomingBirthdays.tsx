
import React, { useMemo } from 'react';
import { Member } from '../types';
import BirthdayIcon from './icons/BirthdayIcon';

interface UpcomingBirthdaysProps {
    members: Member[];
}

const UpcomingBirthdays: React.FC<UpcomingBirthdaysProps> = ({ members }) => {
    
    const upcomingBirthdays = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        const next30Days = new Date();
        next30Days.setDate(today.getDate() + 30);

        return members
            .map(member => {
                const birthDate = new Date(member.birthDate);
                const birthDay = birthDate.getDate();
                const birthMonth = birthDate.getMonth();
                
                let nextBirthday = new Date(today.getFullYear(), birthMonth, birthDay);
                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }

                const age = nextBirthday.getFullYear() - birthDate.getFullYear();

                return { ...member, nextBirthday, age };
            })
            .filter(member => member.nextBirthday >= today && member.nextBirthday <= next30Days)
            .sort((a, b) => a.nextBirthday.getTime() - b.nextBirthday.getTime());

    }, [members]);


    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <div className="text-pink-500 mr-3">
                    <BirthdayIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-700">Prochains Anniversaires</h3>
            </div>
            <div className="space-y-4 max-h-[245px] overflow-y-auto pr-2">
                {upcomingBirthdays.length > 0 ? (
                    upcomingBirthdays.map((member) => (
                        <div key={member.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover mr-4" />
                                <div>
                                    <p className="font-medium text-gray-800">{member.name}</p>
                                    <p className="text-sm text-gray-500">Fête ses {member.age} ans</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-pink-600">
                                    {member.nextBirthday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>Aucun anniversaire à venir dans les 30 prochains jours.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpcomingBirthdays;
